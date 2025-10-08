// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { z } from "zod";

import { EventDetailTypes } from "@amzn/innovation-sandbox-commons/events/index.js";
import { IsbEvent } from "@amzn/innovation-sandbox-commons/sdk-clients/event-bridge-client.js";

export const LeaseOwnerReassignedEventSchema = z.object({
  leaseId: z.string(),
  previousOwner: z.string().email(),
  newOwner: z.string().email(),
  reassignedBy: z.string().email(),
});

export class LeaseOwnerReassignedEvent implements IsbEvent {
  readonly DetailType = EventDetailTypes.LeaseOwnerReassigned;
  readonly Detail: z.infer<typeof LeaseOwnerReassignedEventSchema>;

  constructor(eventData: z.infer<typeof LeaseOwnerReassignedEventSchema>) {
    this.Detail = eventData;
  }

  public static parse(eventDetail: unknown) {
    return new LeaseOwnerReassignedEvent(LeaseOwnerReassignedEventSchema.parse(eventDetail));
  }
}
