import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, Box, FormField } from "@cloudscape-design/components";

import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { NumberFormField } from "@amzn/innovation-sandbox-frontend/components/NumberFormField";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";
import { validateNumber } from "@amzn/innovation-sandbox-frontend/helpers/validators";

interface BudgetFieldsProps {
  alwaysShowValidationErrors?: boolean;
  globalMaxBudget?: number;
  t: any;
}

export const budgetFields = (props?: BudgetFieldsProps) => {
  const { t } = props || {};
  
  return {
    name: "budget",
    title: t("budget"),
    fields: [
      {
        component: componentTypes.RADIO,
        name: "maxBudgetEnabled",
        label: <FormField label={t("maximumBudget")} />,
        options: [
          {
            label: t("doNotSetBudget"),
            value: false,
          },
          {
            label: t("setMaxBudget"),
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
        component: componentTypes.PLAIN_TEXT,
        name: "budgetWarning",
        label: (
          <Box data-inline-block>
            <Alert type="warning">
              {t("noBudgetWarning")}
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
        label: <FormField label={t("maximumBudgetAmount")} />,
        validate: [
          (val: any) => validateNumber(val, t),
          (val: number) =>
            !!props?.globalMaxBudget && val > props.globalMaxBudget
              ? t("maximumBudgetExceeded", { amount: props.globalMaxBudget })
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
        label: t("budgetThresholds"),
        description: t("budgetThresholdsDescription"),
        thresholdType: "budget",
        validate: [thresholdValidator("budget", t)],
        showError: props?.alwaysShowValidationErrors,
      },
    ],
  };
};
