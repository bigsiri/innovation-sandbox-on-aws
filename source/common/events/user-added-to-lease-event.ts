// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

import { EventDetailTypes } from "@amzn/innovation-sandbox-commons/events/index.js";
import { IsbEvent } from "@amzn/innovation-sandbox-commons/sdk-clients/event-bridge-client.js";

export const UserAddedToLeaseEventSchema = z.object({
  leaseId: z.string(),
  addedUserEmail: z.string().email(),
  addedBy: z.string().email(),
  leaseOwner: z.string().email(),
  approvedBy: z.union([z.string().email(), z.literal("AUTO_APPROVED")]),
});

export class UserAddedToLeaseEvent implements IsbEvent {
  readonly DetailType = EventDetailTypes.UserAddedToLease;
  readonly Detail: z.infer<typeof UserAddedToLeaseEventSchema>;

  constructor(eventData: z.infer<typeof UserAddedToLeaseEventSchema>) {
    this.Detail = eventData;
  }

  public static parse(eventDetail: unknown) {
    return new UserAddedToLeaseEvent(UserAddedToLeaseEventSchema.parse(eventDetail));
  }
}
