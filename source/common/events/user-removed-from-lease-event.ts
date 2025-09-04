// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

import { EventDetailTypes } from "@amzn/innovation-sandbox-commons/events/index.js";
import { IsbEvent } from "@amzn/innovation-sandbox-commons/sdk-clients/event-bridge-client.js";

export const UserRemovedFromLeaseEventSchema = z.object({
  leaseId: z.string(),
  removedUserEmail: z.string().email(),
  removedBy: z.string().email(),
  leaseOwner: z.string().email(),
  approvedBy: z.union([z.string().email(), z.literal("AUTO_APPROVED")]),
});

export class UserRemovedFromLeaseEvent implements IsbEvent {
  readonly DetailType = EventDetailTypes.UserRemovedFromLease;
  readonly Detail: z.infer<typeof UserRemovedFromLeaseEventSchema>;

  constructor(eventData: z.infer<typeof UserRemovedFromLeaseEventSchema>) {
    this.Detail = eventData;
  }

  public static parse(eventDetail: unknown) {
    return new UserRemovedFromLeaseEvent(UserRemovedFromLeaseEventSchema.parse(eventDetail));
  }
}
