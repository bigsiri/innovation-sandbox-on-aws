// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

/**
 * Schema for assignment status tracking
 */
export const AssignmentStatusSchema = z.object({
  status: z.enum(["SUCCEEDED", "FAILED"]),
  message: z.string().optional(),
  lastUpdated: z.string().datetime(),
});

/**
 * Schema for a user assigned to a lease
 */
export const LeaseUserSchema = z.object({
  userEmail: z.string().email(),
  addedBy: z.string().email(),
  addedDate: z.string().datetime(),
  assignmentStatus: AssignmentStatusSchema.optional(),
  permissionSetArn: z.string().optional(),
});

export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;
export type LeaseUser = z.infer<typeof LeaseUserSchema>;
