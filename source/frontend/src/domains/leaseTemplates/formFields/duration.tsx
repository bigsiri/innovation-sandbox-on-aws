// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { FormField } from "@cloudscape-design/components";

import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { NumberFormField } from "@amzn/innovation-sandbox-frontend/components/NumberFormField";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { validateNumber } from "@amzn/innovation-sandbox-frontend/helpers/validators";

interface DurationFieldsProps {
  alwaysShowValidationErrors?: boolean;
  globalMaxDuration?: number;
  t: any;
}

export const durationFields = (props?: DurationFieldsProps) => {
  const { t } = props || {};
  
  return {
    name: "duration",
    title: t("leaseDuration"),
    fields: [
      {
        component: componentTypes.RADIO,
        name: "maxDurationEnabled",
        label: <FormField label={t("maximumDuration")} />,
        options: [
          {
            label: t("doNotSetMaxDuration"),
            value: false,
          },
          {
            label: t("setMaxDuration"),
            value: true,
          },
        ],
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: t("selectOption"),
          },
        ],
      },
      {
        component: componentTypes.CUSTOM,
        CustomComponent: NumberFormField,
        isCurrency: false,
        name: "leaseDurationInHours",
        showError: props?.alwaysShowValidationErrors,
        label: <FormField label={t("maximumLeaseDurationHours")} />,
        validate: [
          (val: any) => validateNumber(val, t),
          (val: number) =>
            !!props?.globalMaxDuration && val > props.globalMaxDuration
              ? t("maximumDurationExceeded", { hours: props.globalMaxDuration })
              : undefined,
        ],
        condition: {
          when: "maxDurationEnabled",
          is: true,
          then: {
            visible: true,
          },
        },
      },
      {
        component: componentTypes.PLAIN_TEXT,
        name: "divider",
        label: <Divider />,
        condition: {
          when: "maxDurationEnabled",
          is: true,
          then: {
            visible: true,
          },
        },
      },
      {
        component: componentTypes.CUSTOM,
        CustomComponent: ThresholdSettings,
        name: "durationThresholds",
        label: t("durationThresholds"),
        description: t("durationThresholdsDescription"),
        thresholdType: "duration",
        validate: [thresholdValidator("duration", t)],
        showError: props?.alwaysShowValidationErrors,
        condition: {
          when: "maxDurationEnabled",
          is: true,
          then: {
            visible: true,
          },
        },
      },
    ],
  };
};
