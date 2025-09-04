// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import httpRouterHandler, { Route } from "@middy/http-router";
import {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyResult,
} from "aws-lambda";
import { z } from "zod";

import { PaginatedQueryResult } from "@amzn/innovation-sandbox-commons/data/common-types.js";
import {
  base64DecodeCompositeKey,
  base64EncodeCompositeKey,
} from "@amzn/innovation-sandbox-commons/data/encoding.js";
import { UnknownItem } from "@amzn/innovation-sandbox-commons/data/errors.js";
import {
  validateLeaseCompliesWithGlobalConfig,
  ValidationException,
} from "@amzn/innovation-sandbox-commons/data/global-config/global-config-utils.js";
import {
  AllLeaseStatusSchema,
  isMonitoredLease,
  isPendingLease,
  Lease,
  LeaseKeySchema,
  MonitoredLease,
  MonitoredLeaseSchema,
  MonitoredLeaseStatusSchema,
  PendingLeaseSchema,
} from "@amzn/innovation-sandbox-commons/data/lease/lease.js";
import {
  AccountNotInActiveError,
  CouldNotFindAccountError,
  CouldNotRetrieveUserError,
  InnovationSandbox,
  MaxNumberOfLeasesExceededError,
  NoAccountsAvailableError,
} from "@amzn/innovation-sandbox-commons/innovation-sandbox.js";
import { IsbServices } from "@amzn/innovation-sandbox-commons/isb-services/index.js";
import {
  LeaseLambdaEnvironment,
  LeaseLambdaEnvironmentSchema,
} from "@amzn/innovation-sandbox-commons/lambda/environments/lease-lambda-environment.js";
import apiMiddlewareBundle, {
  IsbApiContext,
  IsbApiEvent,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/api-middleware-bundle.js";
import {
  createHttpJSendError,
  createHttpJSendValidationError,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/http-error-handler.js";
import { httpJsonBodyParser } from "@amzn/innovation-sandbox-commons/lambda/middleware/http-json-body-parser.js";
import {
  ContextWithConfig,
  isbConfigMiddleware,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/isb-config-middleware.js";
import { createPaginationQueryStringParametersSchema } from "@amzn/innovation-sandbox-commons/lambda/schemas.js";
import {
  AppInsightsLogPatterns,
  summarizeUpdate,
} from "@amzn/innovation-sandbox-commons/observability/logging.js";
import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types.js";
import {
  fromTemporaryIsbIdcCredentials,
  fromTemporaryIsbOrgManagementCredentials,
} from "@amzn/innovation-sandbox-commons/utils/cross-account-roles.js";

const tracer = new Tracer();
const logger = new Logger({ serviceName: "Leases" });

const middyFactory = middy<
  IsbApiEvent,
  any,
  Error,
  ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>
>;

const routes: Route<IsbApiEvent, APIGatewayProxyResult>[] = [
  {
    path: "/leases",
    method: "GET",
    handler: middyFactory().handler(getLeasesHandler),
  },
  {
    path: "/leases",
    method: "POST",
    handler: middyFactory().use(httpJsonBodyParser()).handler(postLeaseHandler),
  },
  {
    path: "/leases/{leaseId}",
    method: "GET",
    handler: middyFactory().handler(getLeaseByIdHandler),
  },
  {
    path: "/leases/{leaseId}",
    method: "PATCH",
    handler: middyFactory()
      .use(httpJsonBodyParser())
      .handler(patchLeaseByIdHandler),
  },
  {
    path: "/leases/{leaseId}/freeze",
    method: "POST",
    handler: middyFactory().handler(freezeLeaseHandler),
  },
  {
    path: "/leases/{leaseId}/review",
    method: "POST",
    handler: middyFactory()
      .use(httpJsonBodyParser())
      .handler(reviewLeaseHandler),
  },
  {
    path: "/leases/{leaseId}/terminate",
    method: "POST",
    handler: middyFactory().handler(terminateLeaseHandler),
  },
  {
    path: "/leases/{leaseId}/users",
    method: "GET",
    handler: middyFactory().handler(getLeaseUsersHandler),
  },
  {
    path: "/leases/{leaseId}/users",
    method: "POST",
    handler: middyFactory()
      .use(httpJsonBodyParser())
      .handler(addUsersToLeaseHandler),
  },
  {
    path: "/leases/{leaseId}/users",
    method: "DELETE",
    handler: middyFactory()
      .use(httpJsonBodyParser())
      .handler(removeUsersFromLeaseHandler),
  },
  {
    path: "/leases/shared",
    method: "GET",
    handler: middyFactory().handler(getSharedLeasesHandler),
  },
];

export const handler = apiMiddlewareBundle({
  logger,
  tracer,
  environmentSchema: LeaseLambdaEnvironmentSchema,
})
  .use(isbConfigMiddleware())
  .handler(httpRouterHandler(routes));

async function getLeasesHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const leaseStore = IsbServices.leaseStore(context.env);

  const GetLeasesQueryParametersSchema =
    createPaginationQueryStringParametersSchema({ maxPageSize: 2000 }).extend({
      userEmail: z.string().email().optional(),
    });
  const parsedGetLeasesQueryParametersResult =
    GetLeasesQueryParametersSchema.safeParse(event.queryStringParameters);

  if (!parsedGetLeasesQueryParametersResult.success) {
    throw createHttpJSendValidationError(
      parsedGetLeasesQueryParametersResult.error,
    );
  }

  const { pageIdentifier, pageSize, userEmail } =
    parsedGetLeasesQueryParametersResult.data;

  let findLeasesResponse: PaginatedQueryResult<Lease>;
  if (userEmail !== undefined) {
    if (isUserNotAllowedByEmail(context.user, userEmail)) {
      logger.warn(
        `User ${context.user.email} not allowed to get leases of ${userEmail}`,
      );
      throw createHttpJSendError({
        statusCode: 403,
        data: {
          errors: [
            {
              message: `User is not authorized to get the requested leases.`,
            },
          ],
        },
      });
    }
    findLeasesResponse = await leaseStore.findByUserEmail({
      userEmail,
      pageIdentifier,
      pageSize,
    });
  } else {
    if (isUserNotAllowedByAll(context.user)) {
      throw createHttpJSendError({
        statusCode: 403,
        data: {
          errors: [
            {
              message: `User is not authorized to get all leases.`,
            },
          ],
        },
      });
    }
    findLeasesResponse = await leaseStore.findAll({ pageIdentifier, pageSize });
  }

  if (findLeasesResponse.error) {
    logger.warn(
      `${AppInsightsLogPatterns.DataValidationWarning.pattern}: Error finding leases - ${findLeasesResponse.error}`,
    );
  }

  const data = {
    ...findLeasesResponse,
    result: findLeasesResponse.result.map((lease: Lease) => ({
      ...lease,
      leaseId: base64EncodeCompositeKey({
        userEmail: lease.userEmail,
        uuid: lease.uuid,
      }),
    })),
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: data,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

/**
 * returns true if the user is not allowed to get leasesByEmail by checking the only role attached is "User"
 * and the email is not the same as the user's email
 * @param user
 * @param userEmail
 */
function isUserNotAllowedByEmail(user: IsbUser, userEmail: string) {
  return (
    user.roles!.length === 1 &&
    user.roles![0] === "User" &&
    user.email !== userEmail
  );
}

/**
 * returns true if the user has only "User" role thus not allowed to query all leases
 * @param user
 */
function isUserNotAllowedByAll(user: IsbUser) {
  return user.roles!.length === 1 && user.roles![0] === "User";
}

async function postLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    leaseTemplateStore: IsbServices.leaseTemplateStore(context.env),
    sandboxAccountStore: IsbServices.sandboxAccountStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    orgsService: IsbServices.orgsService(
      context.env,
      fromTemporaryIsbOrgManagementCredentials(context.env),
    ),
    isbEventBridgeClient: IsbServices.isbEventBridge(context.env),
    globalConfig: context.globalConfig,
  };

  const InputLeaseSchema = PendingLeaseSchema.pick({
    comments: true,
  })
    .extend({ leaseTemplateUuid: z.string().uuid() })
    .strict();

  const leaseParseResponse = InputLeaseSchema.safeParse(event.body);
  if (!leaseParseResponse.success) {
    throw createHttpJSendValidationError(leaseParseResponse.error);
  }

  const { leaseTemplateUuid, comments } = leaseParseResponse.data;

  const leaseTemplateResponse =
    await isbContext.leaseTemplateStore.get(leaseTemplateUuid);
  const leaseTemplate = leaseTemplateResponse.result;
  if (leaseParseResponse.error) {
    logger.warn(
      `Error retrieving lease template ${leaseTemplateUuid}: ${leaseTemplateResponse.error}`,
    );
  }
  if (leaseTemplate === undefined) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Unknown lease template.`,
          },
        ],
      },
    });
  }

  try {
    const newLease: Lease = await InnovationSandbox.requestLease(
      {
        leaseTemplate,
        forUser: context.user,
        comments,
      },
      isbContext,
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: "success",
        data: newLease,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    if (error instanceof MaxNumberOfLeasesExceededError) {
      throw createHttpJSendError({
        statusCode: 409,
        data: {
          errors: [
            {
              message: `You have reached the maximum number of active/pending leases allowed (${context.globalConfig.leases.maxLeasesPerUser}).`,
            },
          ],
        },
      });
    } else if (error instanceof NoAccountsAvailableError) {
      throw createHttpJSendError({
        statusCode: 409,
        data: {
          errors: [
            {
              message: `No accounts are available to lease.`,
            },
          ],
        },
      });
    } else {
      throw error;
    }
  }
}

async function getLeaseByIdHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const leaseStore = IsbServices.leaseStore(context.env);

  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );

  const leaseResponse = await leaseStore.get(leaseCompositeKey);
  const lease = leaseResponse.result;
  if (leaseResponse.error) {
    logger.warn(
      `${AppInsightsLogPatterns.DataValidationWarning.pattern}: Error retrieving lease ${leaseCompositeKey}: ${leaseResponse.error}`,
    );
  }

  if (!lease) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Lease not found.`,
          },
        ],
      },
    });
  }
  if (isUserNotAllowedByEmail(context.user, lease.userEmail)) {
    throw createHttpJSendError({
      statusCode: 403,
      data: {
        errors: [
          {
            message: `Active user is not authorized to view leases of requested user.`,
          },
        ],
      },
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: {
        ...lease,
        leaseId: base64EncodeCompositeKey({
          userEmail: lease.userEmail,
          uuid: lease.uuid,
        }),
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

async function patchLeaseByIdHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const leaseStore = IsbServices.leaseStore(context.env);

  const PatchLeaseSchema = MonitoredLeaseSchema.pick({
    maxSpend: true,
    budgetThresholds: true,
    expirationDate: true,
    durationThresholds: true,
  })
    .extend({
      maxSpend: MonitoredLeaseSchema.shape.maxSpend.nullable(),
      expirationDate: MonitoredLeaseSchema.shape.expirationDate.nullable(),
    })
    .partial()
    .strict();

  const patchLeaseParseResponse = PatchLeaseSchema.safeParse(event.body);
  if (!patchLeaseParseResponse.success) {
    throw createHttpJSendValidationError(patchLeaseParseResponse.error);
  }

  const leaseUpdates = Object.fromEntries(
    Object.entries(patchLeaseParseResponse.data).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  );

  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );
  const existingLeaseResponse = await leaseStore.get(leaseCompositeKey);
  const existingLease = existingLeaseResponse.result;
  if (existingLeaseResponse.error) {
    logger.warn(
      `Error retrieving lease ${leaseCompositeKey}: ${existingLeaseResponse.error}`,
    );
  }

  if (!existingLease) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Lease not found.`,
          },
        ],
      },
    });
  }

  if (!isMonitoredLease(existingLease)) {
    throw createHttpJSendError({
      statusCode: 400,
      data: {
        errors: [
          {
            message: `Can only update an active lease`,
          },
        ],
      },
    });
  }

  const updatedLease: Lease = {
    ...existingLease,
    ...leaseUpdates,
  };

  try {
    validateLeaseCompliesWithGlobalConfig(updatedLease, context.globalConfig);
  } catch (error) {
    if (error instanceof ValidationException) {
      throw createHttpJSendError({
        statusCode: 400,
        data: {
          errors: [
            {
              message: error.message,
            },
          ],
        },
      });
    } else {
      throw error;
    }
  }

  try {
    const putResult = await leaseStore.update(updatedLease);

    logger.info(
      `Updated Lease ${existingLease.uuid}`,
      summarizeUpdate(putResult),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
        data: putResult.newItem,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    if (error instanceof UnknownItem) {
      throw createHttpJSendError({
        statusCode: 404,
        data: {
          errors: [
            {
              message: `Lease not found.`,
            },
          ],
        },
      });
    } else {
      throw error;
    }
  }
}

async function reviewLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
) {
  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    sandboxAccountStore: IsbServices.sandboxAccountStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    orgsService: IsbServices.orgsService(
      context.env,
      fromTemporaryIsbOrgManagementCredentials(context.env),
    ),
    isbEventBridgeClient: IsbServices.isbEventBridge(context.env),
    globalConfig: context.globalConfig,
  };

  const ReviewLeaseBodySchema = z
    .object({
      action: z.enum(["Approve", "Deny"]),
    })
    .strict();
  const parsedReviewLeaseBody = ReviewLeaseBodySchema.safeParse(event.body);
  if (!parsedReviewLeaseBody.success) {
    throw createHttpJSendValidationError(parsedReviewLeaseBody.error);
  }

  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );
  const leaseResponse = await isbContext.leaseStore.get(leaseCompositeKey);
  const lease = leaseResponse.result;
  if (leaseResponse.error) {
    logger.warn(
      `Error retrieving lease ${leaseCompositeKey}: ${leaseResponse.error}`,
    );
  }

  if (!lease) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Lease not found.`,
          },
        ],
      },
    });
  }

  if (!isPendingLease(lease)) {
    throw createHttpJSendError({
      statusCode: 409,
      data: {
        errors: [
          {
            message: `Only leases in a pending state can be approved/denied.`,
          },
        ],
      },
    });
  }

  if (parsedReviewLeaseBody.data.action == "Approve") {
    try {
      await InnovationSandbox.approveLease(
        { lease, approver: context.user },
        isbContext,
      );
    } catch (error) {
      if (error instanceof NoAccountsAvailableError) {
        throw createHttpJSendError({
          statusCode: 409,
          data: {
            errors: [
              {
                message: `There are no more sandbox accounts available. Please contact your administrator.`,
              },
            ],
          },
        });
      } else {
        throw error;
      }
    }
  } else {
    await InnovationSandbox.denyLease(
      { lease, denier: context.user },
      isbContext,
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: null,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

async function freezeLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
) {
  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    sandboxAccountStore: IsbServices.sandboxAccountStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    orgsService: IsbServices.orgsService(
      context.env,
      fromTemporaryIsbOrgManagementCredentials(context.env),
    ),
    eventBridgeClient: IsbServices.isbEventBridge(context.env),
  };

  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );
  const leaseResponse = await isbContext.leaseStore.get(leaseCompositeKey);
  const lease = leaseResponse.result;
  if (leaseResponse.error) {
    logger.warn(
      `Error retrieving lease ${leaseCompositeKey}: ${leaseResponse.error}`,
    );
  }

  if (!lease) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Lease not found.`,
          },
        ],
      },
    });
  }

  if (!isMonitoredLease(lease)) {
    throw createHttpJSendError({
      statusCode: 409,
      data: {
        errors: [
          {
            message: `Only active leases can be frozen.`,
          },
        ],
      },
    });
  }

  try {
    await InnovationSandbox.freezeLease(
      {
        lease,
        reason: {
          type: "ManuallyFrozen",
          comment: `Manually frozen by ${context.user.email}`,
        },
      },
      isbContext,
    );
  } catch (error) {
    if (error instanceof AccountNotInActiveError) {
      throw createHttpJSendError({
        statusCode: 409,
        data: { errors: [{ message: error.message }] },
      });
    } else if (
      error instanceof CouldNotFindAccountError ||
      error instanceof CouldNotRetrieveUserError
    ) {
      throw createHttpJSendError({
        statusCode: 404,
        data: { errors: [{ message: error.message }] },
      });
    } else {
      throw error;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: null,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
async function terminateLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    sandboxAccountStore: IsbServices.sandboxAccountStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    orgsService: IsbServices.orgsService(
      context.env,
      fromTemporaryIsbOrgManagementCredentials(context.env),
    ),
    eventBridgeClient: IsbServices.isbEventBridge(context.env),
    globalConfig: context.globalConfig,
  };
  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );
  const leaseResponse = await isbContext.leaseStore.get(leaseCompositeKey);
  const lease = leaseResponse.result;
  if (leaseResponse.error) {
    logger.warn(
      `Error retrieving lease ${leaseCompositeKey}: ${leaseResponse.error}`,
    );
  }

  if (!lease) {
    throw createHttpJSendError({
      statusCode: 404,
      data: {
        errors: [
          {
            message: `Lease not found.`,
          },
        ],
      },
    });
  }

  if (!isMonitoredLease(lease)) {
    throw createHttpJSendError({
      statusCode: 409,
      data: {
        errors: [
          {
            message: `Only [${MonitoredLeaseStatusSchema.options.join(", ")}] leases can be terminated.`,
          },
        ],
      },
    });
  }

  try {
    await InnovationSandbox.terminateLease(
      { lease, expiredStatus: "ManuallyTerminated" },
      isbContext,
    );
  } catch (error) {
    if (
      error instanceof CouldNotFindAccountError ||
      error instanceof CouldNotRetrieveUserError
    ) {
      throw createHttpJSendError({
        statusCode: 404,
        data: { errors: [{ message: error.message }] },
      });
    } else {
      throw error;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: null,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
}

function parseLeaseCompositeKeyFromPathParameters(
  pathParameters: APIGatewayProxyEventPathParameters,
) {
  const PathParametersSchema = z.object({ leaseId: z.string().base64() });
  const parsedPathParametersResponse =
    PathParametersSchema.safeParse(pathParameters);
  if (!parsedPathParametersResponse.success) {
    throw createHttpJSendValidationError(parsedPathParametersResponse.error);
  }

  let decodedCompositeKey: Record<string, any> | undefined;
  try {
    decodedCompositeKey = base64DecodeCompositeKey(pathParameters.leaseId);
  } catch (e) {
    throw createHttpJSendError({
      statusCode: 400,
      data: {
        errors: [{ message: "LeaseId path parameter provided is invalid." }],
      },
    });
  }

  const leaseKeySchemaParseResponse =
    LeaseKeySchema.safeParse(decodedCompositeKey);

  if (!leaseKeySchemaParseResponse.success)
    throw createHttpJSendValidationError(leaseKeySchemaParseResponse.error);

  return leaseKeySchemaParseResponse.data;
}

/**
 * GET /leases/{leaseId}/users
 * Get all users assigned to a lease
 */
async function getLeaseUsersHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const lease = await validateLeaseAccess(event, context, 'view');

  const users = (lease.users || []).map(leaseUser => ({
    userId: leaseUser.userEmail,
    email: leaseUser.userEmail,
    displayName: leaseUser.userEmail.split('@')[0],
    status: leaseUser.assignmentStatus?.status === 'SUCCEEDED' ? 'ACTIVE' : 'FAILED',
    assignedAt: leaseUser.addedDate,
    assignedBy: leaseUser.addedBy,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: { users, totalCount: users.length },
    }),
    headers: { "Content-Type": "application/json" },
  };
}
/**
 * Common helper to validate lease access and return lease with users
 */
async function validateLeaseAccess(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
  operation: 'add' | 'remove' | 'view'
): Promise<Lease> {
  const leaseCompositeKey = parseLeaseCompositeKeyFromPathParameters(
    event.pathParameters,
  );

  const leaseStore = IsbServices.leaseStore(context.env);
  const leaseResponse = await leaseStore.get(leaseCompositeKey);
  
  if (leaseResponse.error) {
    throw createHttpJSendError({
      statusCode: 404,
      data: { errors: [{ message: "Lease not found." }] },
    });
  }

  const lease = leaseResponse.result!;
  
  // Check authorization based on operation
  const isOwner = context.user.email === lease.userEmail;
  const hasAdminAccess = !isUserNotAllowedByAll(context.user);
  
  if (operation === 'view') {
    // For viewing: owner, shared user, or admin can access
    const isSharedUser = lease.users?.some(user => user.userEmail === context.user.email);
    if (!isOwner && !isSharedUser && !hasAdminAccess) {
      throw createHttpJSendError({
        statusCode: 403,
        data: { errors: [{ message: "Access denied." }] },
      });
    }
  } else {
    // For add/remove: basic access check (detailed permissions checked separately)
    if (!isOwner && !hasAdminAccess) {
      throw createHttpJSendError({
        statusCode: 403,
        data: { errors: [{ message: "Access denied." }] },
      });
    }
  }

  // For adding/removing users, ensure lease is in active state (MonitoredLease)
  if ((operation === 'add' || operation === 'remove') && !isMonitoredLease(lease)) {
    throw createHttpJSendError({
      statusCode: 400,
      data: { errors: [{ message: `Cannot ${operation} users to inactive lease.` }] },
    });
  }

  return lease;
}

/**
 * Validate if user has permission to manage users on a lease based on template settings
 */
async function validateUserManagementPermission(
  user: { email: string; roles?: string[] },
  lease: Lease,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>
): Promise<void> {
  // Admins and Managers can always manage users
  const isManagerOrAdmin = user.roles?.includes("Admin") || user.roles?.includes("Manager");
  if (isManagerOrAdmin) {
    return; // Permission granted
  }

  // Check if user is the lease owner
  const isOwner = user.email === lease.userEmail;
  if (!isOwner) {
    throw createHttpJSendError({
      statusCode: 403,
      data: { errors: [{ message: "Only lease owner, managers, or admins can manage users." }] },
    });
  }

  // For lease owners, check if the lease template allows user management
  try {
    const leaseTemplateStore = IsbServices.leaseTemplateStore(context.env);
    const templateResponse = await leaseTemplateStore.get({ uuid: lease.originalLeaseTemplateUuid });
    
    if (templateResponse.error) {
      // If template not found, default to allowing user management for backwards compatibility
      logger.warn(`Lease template ${lease.originalLeaseTemplateUuid} not found, defaulting to allow user management`, {
        leaseId: lease.uuid,
        templateUuid: lease.originalLeaseTemplateUuid,
      });
      return;
    }

    const leaseTemplate = templateResponse.result!;
    
    // Check if template allows owner user management (default to true for backwards compatibility)
    if (!leaseTemplate.allowOwnerUserManagement) {
      throw createHttpJSendError({
        statusCode: 403,
        data: { errors: [{ message: "User management is disabled for this lease template." }] },
      });
    }
  } catch (error) {
    // If there's any error accessing the template, log it but allow the operation
    // This prevents 500 errors from blocking legitimate user management operations
    logger.error(`Error validating lease template permissions, defaulting to allow`, {
      leaseId: lease.uuid,
      templateUuid: lease.originalLeaseTemplateUuid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Default to allowing user management to prevent blocking legitimate operations
    return;
  }
}

/**
 * DELETE /leases/{leaseId}/users
 * Remove users from a lease
 */
async function removeUsersFromLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const RequestBodySchema = z.object({
    userEmails: z.array(z.string().email()).min(1).max(parseInt(context.env.MAX_BULK_USER_ASSIGNMENT)),
  });
  
  const requestBody = RequestBodySchema.parse(event.body);
  const userEmails = requestBody.userEmails;
  const lease = await validateLeaseAccess(event, context, 'remove');
  
  // Validate user management permissions based on template settings
  await validateUserManagementPermission(context.user, lease, context);
  
  // Type assertion safe because validateLeaseAccess ensures MonitoredLease for 'remove' operation
  const monitoredLease = lease as MonitoredLease;

  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    isbEventBridgeClient: IsbServices.isbEventBridge(context.env),
  };

  const results = await InnovationSandbox.removeUsersFromLease(
    {
      lease: monitoredLease,
      userEmails,
      removedBy: context.user,
    },
    isbContext,
  );

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: {
        summary: {
          requested: userEmails.length,
          successful: successCount,
          failed: failureCount,
        },
        results,
      },
    }),
    headers: { "Content-Type": "application/json" },
  };
}

/**
 * GET /leases/shared
 * Get leases shared with the current user
 */
async function getSharedLeasesHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const QueryParamsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: AllLeaseStatusSchema.optional(),
    includeOwned: z.coerce.boolean().default(false),
  });

  const queryParams = QueryParamsSchema.parse(event.queryStringParameters || {});

  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
  };

  const result = await InnovationSandbox.getSharedLeases(
    {
      user: context.user,
      filters: queryParams,
    },
    isbContext,
  );

  // Encode leaseIds for API response
  const response = {
    ...result,
    leases: result.leases.map(lease => ({
      ...lease,
      leaseId: base64EncodeCompositeKey({ userEmail: lease.userEmail, uuid: lease.uuid }),
    })),
  };

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: response,
    }),
    headers: { "Content-Type": "application/json" },
  };
}
/**
 * POST /leases/{leaseId}/users
 * Add users to a lease
 */
async function addUsersToLeaseHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<LeaseLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const RequestBodySchema = z.object({
    userEmails: z.array(z.string().email()).min(1).max(parseInt(context.env.MAX_BULK_USER_ASSIGNMENT)),
  });
  
  const requestBody = RequestBodySchema.parse(event.body);
  const userEmails = requestBody.userEmails;
  const lease = await validateLeaseAccess(event, context, 'add');
  
  // Validate user management permissions based on template settings
  await validateUserManagementPermission(context.user, lease, context);
  
  // Type assertion safe because validateLeaseAccess ensures MonitoredLease for 'add' operation
  const monitoredLease = lease as MonitoredLease;

  const isbContext = {
    logger,
    tracer,
    leaseStore: IsbServices.leaseStore(context.env),
    idcService: IsbServices.idcService(
      context.env,
      fromTemporaryIsbIdcCredentials(context.env),
    ),
    isbEventBridgeClient: IsbServices.isbEventBridge(context.env),
  };

  const results = await InnovationSandbox.addUsersToLease(
    {
      lease: monitoredLease,
      userEmails,
      addedBy: context.user,
    },
    isbContext,
  );

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
        },
      },
    }),
    headers: { "Content-Type": "application/json" },
  };
}
