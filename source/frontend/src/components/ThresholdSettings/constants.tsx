// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SelectProps } from "@cloudscape-design/components";

import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

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

export const ThresholdActionOptions: SelectProps.Options = [
  { label: "Send Alert", value: "ALERT" },
  { label: "Freeze Account", value: "FREEZE_ACCOUNT" },
];

export const getTranslatedThresholdActionOptions = (t: TranslationFunction): SelectProps.Options => [
  { label: t('thresholds.actions.sendAlert'), value: "ALERT" },
  { label: t('thresholds.actions.freezeAccount'), value: "FREEZE_ACCOUNT" },
  { label: t('thresholds.actions.wipeAccount'), value: "WIPE_ACCOUNT" },
];
