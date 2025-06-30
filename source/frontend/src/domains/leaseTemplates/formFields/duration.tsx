// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";

import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { NumberFormField } from "@amzn/innovation-sandbox-frontend/components/NumberFormField";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";
import { validateNumber } from "@amzn/innovation-sandbox-frontend/helpers/validators";

interface DurationFieldsProps {
  alwaysShowValidationErrors?: boolean;
  globalMaxDuration?: number;
  t?: TranslationFunction;
}

export const durationFields = (props?: DurationFieldsProps) => {
  const { t, alwaysShowValidationErrors, globalMaxDuration } = props || {};
  
  return {
  name: "duration",
  title: t ? t('forms.duration.title', { ns: 'leaseTemplates' }) : "Lease Duration",
  fields: [
    {
      component: componentTypes.RADIO,
      name: "maxDurationEnabled",
      label: t ? t('forms.duration.maxDuration.label', { ns: 'leaseTemplates' }) : "Maximum Duration",
      options: [
        {
          label: t ? t('forms.duration.maxDuration.none', { ns: 'leaseTemplates' }) : "Do not set a maximum duration",
          value: false,
        },
        {
          label: t ? t('forms.duration.maxDuration.set', { ns: 'leaseTemplates' }) : "Set a maximum duration",
          value: true,
        },
      ],
      validate: [
        {
          type: validatorTypes.REQUIRED,
          message: t ? t('forms.duration.maxDuration.required', { ns: 'leaseTemplates' }) : "Please select an option",
        },
      ],
    },
    {
      component: componentTypes.CUSTOM,
      CustomComponent: NumberFormField,
      isCurrency: false,
      name: "leaseDurationInHours",
      showError: alwaysShowValidationErrors,
      label: t ? t('forms.duration.hours.label', { ns: 'leaseTemplates' }) : "Maximum Lease Duration (in hours)",
      validate: [
        validateNumber,
        (val: number) =>
          !!globalMaxDuration && val > globalMaxDuration
            ? t ? t('forms.duration.hours.validation', { ns: 'leaseTemplates', replace: { max: globalMaxDuration } }) : `Maximum lease duration is ${globalMaxDuration} hours`
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
      label: t ? t('thresholds.durationThresholds', { ns: 'leases' }) : "Duration Thresholds",
      description: t ? t('thresholds.durationDescription', { ns: 'leases' }) : "Determine what happens as time passes.",
      thresholdType: "duration",
      validate: [thresholdValidator("duration")],
      showError: alwaysShowValidationErrors,
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
