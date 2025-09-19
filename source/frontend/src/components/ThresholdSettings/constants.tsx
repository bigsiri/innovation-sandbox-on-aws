// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SelectProps } from "@cloudscape-design/components";

export const getThresholdTypes = (t?: any) => ({
  budget: {
    label: t ? t("thresholds.isConsumed", { ns: "leases" }) : "is consumed",
    isCurrency: true,
    valueAttributeName: "dollarsSpent",
    maxValueAttributeName: "maxSpend",
    maxValueEnabledAttributeName: "maxBudgetEnabled",
    lastThresholdIsZero: false,
  },
  duration: {
    label: t ? t("thresholds.hoursRemain", { ns: "leases" }) : "hours remain",
    isCurrency: false,
    valueAttributeName: "hoursRemaining",
    maxValueAttributeName: "leaseDurationInHours",
    maxValueEnabledAttributeName: "maxDurationEnabled",
    lastThresholdIsZero: true,
  },
});

export const ThresholdTypes = {
  budget: {
    label: "is consumed",
    isCurrency: true,
    valueAttributeName: "dollarsSpent",
    maxValueAttributeName: "maxSpend",
    maxValueEnabledAttributeName: "maxBudgetEnabled",
    lastThresholdIsZero: false,
  },
  duration: {
    label: "hours remain",
    isCurrency: false,
    valueAttributeName: "hoursRemaining",
    maxValueAttributeName: "leaseDurationInHours",
    maxValueEnabledAttributeName: "maxDurationEnabled",
    lastThresholdIsZero: true,
  },
};

export const getThresholdActionOptions = (t?: any): SelectProps.Options => [
  { label: t ? t("thresholds.sendAlert", { ns: "leases" }) : "Send Alert", value: "ALERT" },
  { label: t ? t("thresholds.freezeAccount", { ns: "leases" }) : "Freeze Account", value: "FREEZE_ACCOUNT" },
  { label: t ? t("thresholds.wipeAccount", { ns: "leases" }) : "Wipe Account", value: "WIPE_ACCOUNT" },
];
