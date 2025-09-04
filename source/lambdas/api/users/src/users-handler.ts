// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import httpRouterHandler, { Route } from "@middy/http-router";
import { APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";

import { IsbServices } from "@amzn/innovation-sandbox-commons/isb-services/index.js";
import {
  UserLambdaEnvironment,
  UserLambdaEnvironmentSchema,
} from "@amzn/innovation-sandbox-commons/lambda/environments/user-lambda-environment.js";
import apiMiddlewareBundle, {
  IsbApiContext,
  IsbApiEvent,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/api-middleware-bundle.js";
import {
  createHttpJSendError,
  createHttpJSendValidationError,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/http-error-handler.js";
import {
  ContextWithConfig,
  isbConfigMiddleware,
} from "@amzn/innovation-sandbox-commons/lambda/middleware/isb-config-middleware.js";
import { fromTemporaryIsbIdcCredentials } from "@amzn/innovation-sandbox-commons/utils/cross-account-roles.js";

const tracer = new Tracer();
const logger = new Logger({ serviceName: "Users" });

const middyFactory = middy<
  IsbApiEvent,
  any,
  Error,
  ContextWithConfig & IsbApiContext<UserLambdaEnvironment>
>;

const routes: Route<IsbApiEvent, APIGatewayProxyResult>[] = [
  {
    path: "/users/search",
    method: "GET",
    handler: middyFactory().handler(searchUsersHandler),
  },
];

export const handler = apiMiddlewareBundle({
  logger,
  tracer,
  environmentSchema: UserLambdaEnvironmentSchema,
})
  .use(isbConfigMiddleware())
  .handler(httpRouterHandler(routes));

async function searchUsersHandler(
  event: IsbApiEvent,
  context: ContextWithConfig & IsbApiContext<UserLambdaEnvironment>,
): Promise<APIGatewayProxyResult> {
  const SearchUsersQueryParametersSchema = z.object({
    q: z.string().min(2).max(100),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  });

  const parsedQueryParams = SearchUsersQueryParametersSchema.safeParse(
    event.queryStringParameters
  );

  if (!parsedQueryParams.success) {
    throw createHttpJSendValidationError(parsedQueryParams.error);
  }

  const { q: query, limit } = parsedQueryParams.data;

  const idcService = IsbServices.idcService(
    context.env,
    fromTemporaryIsbIdcCredentials(context.env),
  );

  try {
    // Get all ISB users (users, managers, admins)
    const [usersResult, managersResult, adminsResult] = await Promise.all([
      idcService.listIsbUsers({ pageSize: 100 }),
      idcService.listIsbManagers({ pageSize: 100 }),
      idcService.listIsbAdmins({ pageSize: 100 }),
    ]);

    // Combine all users and remove duplicates
    const allUsers = [
      ...usersResult.result,
      ...managersResult.result,
      ...adminsResult.result,
    ];

    const uniqueUsers = allUsers.filter((user, index, self) =>
      index === self.findIndex(u => u.email === user.email)
    );

    // Filter users based on search query
    const filteredUsers = uniqueUsers
      .filter(user => {
        const searchTerm = query.toLowerCase();
        return (
          user.email.toLowerCase().includes(searchTerm) ||
          (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) ||
          (user.userName && user.userName.toLowerCase().includes(searchTerm))
        );
      })
      .slice(0, limit)
      .map(user => ({
        email: user.email,
        displayName: user.displayName || user.userName || user.email.split('@')[0],
        userId: user.userId,
        roles: user.roles,
      }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "success",
        data: {
          users: filteredUsers,
          totalCount: filteredUsers.length,
          hasMore: filteredUsers.length === limit,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    logger.error("Error searching users", { error });
    throw createHttpJSendError({
      statusCode: 500,
      data: {
        errors: [
          {
            message: "Failed to search users",
          },
        ],
      },
    });
  }
}
