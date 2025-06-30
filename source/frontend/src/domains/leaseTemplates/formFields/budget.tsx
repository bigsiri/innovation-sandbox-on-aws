// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, Box } from "@cloudscape-design/components";

import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { NumberFormField } from "@amzn/innovation-sandbox-frontend/components/NumberFormField";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { validateNumber } from "@amzn/innovation-sandbox-frontend/helpers/validators";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

interface BudgetFieldsProps {
  alwaysShowValidationErrors?: boolean;
  globalMaxBudget?: number;
  t?: TranslationFunction;
}

export const budgetFields = (props?: BudgetFieldsProps) => {
  const { globalMaxBudget, t } = props || {};
  
  return {
    name: "budget",
    title: t ? t('forms.budget.title', { ns: 'leaseTemplates' }) : "Budget Settings",
    fields: [
      {
        component: componentTypes.RADIO,
        name: "maxBudgetEnabled",
        label: t ? t('forms.budget.maxBudgetLabel', { ns: 'leaseTemplates' }) : "Budget Limit",
        options: [
          {
            label: t ? t('forms.budget.noBudgetOption', { ns: 'leaseTemplates' }) : "No budget limit",
            value: false,
          },
          {
            label: t ? t('forms.budget.setBudgetOption', { ns: 'leaseTemplates' }) : "Set budget limit",
            value: true,
          },
        ],
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: "Please select an option", // t!('forms.budget.selectOptionRequired', { ns: 'leaseTemplates' }),
          },
        ],
      },
      {
        component: componentTypes.PLAIN_TEXT,
        name: "budgetWarning",
        label: (
          <Box data-inline-block>
            <Alert type="warning">
              No budget limit is set. Users can spend unlimited amounts.
            </Alert>
          </Box>
        ),
        condition: {
          when: "maxBudgetEnabled",
          is: false,
          then: {
            visible: true,
          },
        },
      },
      {
        component: componentTypes.CUSTOM,
        CustomComponent: NumberFormField,
        isCurrency: true,
        name: "maxSpend",
        showError: props?.alwaysShowValidationErrors,
        label: t ? t('forms.budget.maxBudgetAmount', { ns: 'leaseTemplates' }) : "Maximum Budget Amount",
        validate: [
          validateNumber,
          (val: number) =>
            !!globalMaxBudget && val > globalMaxBudget
              ? `Budget cannot exceed $${globalMaxBudget}` // t!('forms.budget.maxBudgetExceeded', { ns: 'leaseTemplates', replace: { amount: props.globalMaxBudget } })
              : undefined,
        ],
        condition: {
          when: "maxBudgetEnabled",
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
      },
      {
        component: componentTypes.CUSTOM,
        CustomComponent: ThresholdSettings,
        name: "budgetThresholds",
        label: t ? t('forms.budget.thresholdsLabel', { ns: 'leaseTemplates' }) : "Budget Thresholds",
        description: "Set alerts and actions when budget thresholds are reached", // t!('budget.thresholdsDescription', { ns: 'leases' }),
        thresholdType: "budget",
        validate: [thresholdValidator("budget")],
        showError: props?.alwaysShowValidationErrors,
      },
    ],
  };
};
