// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { APIGatewayProxyResult } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAPIGatewayProxyEvent,
  isbAuthorizedUser,
  mockAuthorizedContext,
} from "@amzn/innovation-sandbox-commons/test/lambdas/fixtures.js";
import { generateSchemaData } from "@amzn/innovation-sandbox-commons/test/generate-schema-data.js";
import { UserLambdaEnvironmentSchema } from "@amzn/innovation-sandbox-commons/lambda/environments/user-lambda-environment.js";

import { handler } from "../src/users-handler.js";

const mockIdcService = {
  searchUsers: vi.fn(),
};

vi.mock("@amzn/innovation-sandbox-commons/isb-services/index.js", () => ({
  IsbServices: {
    idcService: vi.fn(() => mockIdcService),
  },
}));

describe("Users Handler", () => {
  const testEnv = generateSchemaData(UserLambdaEnvironmentSchema);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /users/search", () => {
    it("should return 200 with search results", async () => {
      const mockUsers = [
        { email: "user1@example.com", displayName: "User One" },
        { email: "user2@example.com", displayName: "User Two" },
      ];

      mockIdcService.searchUsers.mockResolvedValue(mockUsers);

      const event = createAPIGatewayProxyEvent({
        httpMethod: "GET",
        path: "/users/search",
        queryStringParameters: { query: "user" },
        headers: {
          Authorization: `Bearer ${isbAuthorizedUser.token}`,
        },
      });

      const response: APIGatewayProxyResult = await handler(event, mockAuthorizedContext(testEnv));

      expect(response.statusCode).toBe(200);
      expect(mockIdcService.searchUsers).toHaveBeenCalledWith("user");
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.status).toBe("success");
      expect(responseBody.data.users).toEqual(mockUsers);
    });

    it("should return 400 when query parameter is missing", async () => {
      const event = createAPIGatewayProxyEvent({
        httpMethod: "GET",
        path: "/users/search",
        headers: {
          Authorization: `Bearer ${isbAuthorizedUser.token}`,
        },
      });

      const response: APIGatewayProxyResult = await handler(event, mockAuthorizedContext(testEnv));

      expect(response.statusCode).toBe(400);
      expect(mockIdcService.searchUsers).not.toHaveBeenCalled();
    });

    it("should return 500 when IDC service fails", async () => {
      mockIdcService.searchUsers.mockRejectedValue(new Error("IDC service error"));

      const event = createAPIGatewayProxyEvent({
        httpMethod: "GET",
        path: "/users/search",
        queryStringParameters: { query: "user" },
        headers: {
          Authorization: `Bearer ${isbAuthorizedUser.token}`,
        },
      });

      const response: APIGatewayProxyResult = await handler(event, mockAuthorizedContext(testEnv));

      expect(response.statusCode).toBe(500);
      expect(mockIdcService.searchUsers).toHaveBeenCalledWith("user");
    });
  });
});
