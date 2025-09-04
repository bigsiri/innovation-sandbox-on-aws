// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import path from "path";

import { UserLambdaEnvironmentSchema } from "@amzn/innovation-sandbox-commons/lambda/environments/user-lambda-environment.js";
import { sharedIdcSsmParamName } from "@amzn/innovation-sandbox-commons/types/isb-types";
import {
  RestApi,
  RestApiProps,
} from "@amzn/innovation-sandbox-infrastructure/components/api/rest-api-all";
import { addAppConfigExtensionLayer } from "@amzn/innovation-sandbox-infrastructure/components/config/app-config-lambda-extension";
import { IsbLambdaFunction } from "@amzn/innovation-sandbox-infrastructure/components/isb-lambda-function";
import {
  getIdcRoleArn,
  IntermediateRole,
} from "@amzn/innovation-sandbox-infrastructure/helpers/isb-roles";
import {
  grantIsbAppConfigRead,
  grantIsbSsmParameterRead,
} from "@amzn/innovation-sandbox-infrastructure/helpers/policy-generators";
import { IsbComputeStack } from "@amzn/innovation-sandbox-infrastructure/isb-compute-stack";

export class UsersApi {
  constructor(restApi: RestApi, scope: Construct, props: RestApiProps) {
    const {
      configApplicationId,
      configEnvironmentId,
      globalConfigConfigurationProfileId,
    } = IsbComputeStack.sharedSpokeConfig.data;

    const usersLambdaFunction = new IsbLambdaFunction(
      scope,
      "UsersLambdaFunction",
      {
        description:
          "Lambda used as API GW method integration for users resources",
        entry: path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "lambdas",
          "api",
          "users",
          "src",
          "users-handler.ts",
        ),
        handler: "handler",
        logGroup: restApi.logGroup,
        namespace: props.namespace,
        environment: {
          APP_CONFIG_APPLICATION_ID: configApplicationId,
          APP_CONFIG_ENVIRONMENT_ID: configEnvironmentId,
          APP_CONFIG_PROFILE_ID: globalConfigConfigurationProfileId,
          AWS_APPCONFIG_EXTENSION_PREFETCH_LIST: `/applications/${configApplicationId}/environments/${configEnvironmentId}/configurations/${globalConfigConfigurationProfileId}`,
          ISB_NAMESPACE: props.namespace,
          IDC_ACCOUNT_ID: props.idcAccountId,
          IDC_ROLE_ARN: getIdcRoleArn(scope, props.namespace, props.idcAccountId),
          INTERMEDIATE_ROLE_ARN: IntermediateRole.getRoleArn(),
        },
        envSchema: UserLambdaEnvironmentSchema,
      },
    );

    grantIsbAppConfigRead(
      scope,
      usersLambdaFunction,
      globalConfigConfigurationProfileId,
    );
    addAppConfigExtensionLayer(usersLambdaFunction);

    // Grant permissions to assume IDC role for user search
    IntermediateRole.addTrustedRole(
      usersLambdaFunction.lambdaFunction.role! as Role,
    );

    // Grant explicit permission to assume IdcRole
    usersLambdaFunction.lambdaFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [getIdcRoleArn(scope, props.namespace, props.idcAccountId)],
      }),
    );

    // Grant permission to read IDC configuration from SSM
    grantIsbSsmParameterRead(
      usersLambdaFunction.lambdaFunction.role! as Role,
      sharedIdcSsmParamName(props.namespace),
    );

    const usersResource = restApi.root.addResource("users");
    const searchResource = usersResource.addResource("search");

    searchResource.addMethod("GET", new LambdaIntegration(usersLambdaFunction.lambdaFunction));
  }
}
