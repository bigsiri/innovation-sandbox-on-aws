// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, FormField } from "@cloudscape-design/components";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { MonitoredLease } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { DateTimeFormField } from "@amzn/innovation-sandbox-frontend/components/DateTimeFormField";
import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { ThresholdSettings } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings";
import { thresholdValidator } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/validator";

export type LeaseDurationFormProps = {
  expirationDate: MonitoredLease["expirationDate"];
  durationThresholds: MonitoredLease["durationThresholds"];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isUpdating?: boolean;
};

export type LeaseDurationFormData = {
  expirationDate: MonitoredLease["expirationDate"];
  durationThresholds: MonitoredLease["durationThresholds"];
  expiryDateEnabled: boolean;
};

export const LeaseDurationForm = ({
  expirationDate,
  durationThresholds,
  onSubmit,
  onCancel,
  isUpdating,
}: LeaseDurationFormProps) => {
  const { t } = useTranslation();
  return (
    <Form
      insideTab
      isSubmitting={isUpdating}
      onCancel={onCancel}
      onSubmit={onSubmit}
      initialValues={{
        expirationDate,
        durationThresholds,
        expiryDateEnabled: !!expirationDate,
      }}
      validate={(data) => {
        const formValues = data as LeaseDurationFormData;
        const validateDuration = thresholdValidator("duration");

        const durationError = validateDuration(
          formValues.durationThresholds,
          formValues,
        );

        if (durationError) {
          return {
            durationThresholds: durationError,
          };
        }
      }}
      schema={{
        submitLabel: t("duration.updateDurationSettings", { ns: "leases" }),
        fields: [
          {
            component: componentTypes.SUB_FORM,
            name: "duration",
            title: t("duration.leaseDuration", { ns: "leases" }),
            fields: [
              {
                component: componentTypes.PLAIN_TEXT,
                name: "info",
                label: (
                  <Alert type="info">
                    {expirationDate ? (
                      <>
                        {t("duration.currentlyExpires", { ns: "leases" })}{" "}
                        <DurationStatus date={expirationDate} />
                      </>
                    ) : (
                      <>{t("duration.currentlyNoExpiry", { ns: "leases" })}</>
                    )}
                  </Alert>
                ),
              },
              {
                component: componentTypes.RADIO,
                name: "expiryDateEnabled",
                label: <FormField label={t("duration.expiryDate", { ns: "leases" })} />,
                options: [
                  {
                    label: expirationDate
                      ? t("duration.removeExpiryDate", { ns: "leases" })
                      : t("duration.doNotSetExpiryDate", { ns: "leases" }),
                    value: false,
                  },
                  {
                    label: t("duration.setExpiryDate", { ns: "leases" }),
                    value: true,
                  },
                ],
                validate: [
                  {
                    type: validatorTypes.REQUIRED,
                    message: t("duration.selectOption", { ns: "leases" }),
                  },
                ],
              },
              {
                component: componentTypes.CUSTOM,
                CustomComponent: DateTimeFormField,
                isCurrency: false,
                name: "expirationDate",
                showError: true,
                validate: [
                  (date: Date) => {
                    if (!date) {
                      return t("duration.enterValidDate", { ns: "leases" });
                    }

                    // Convert to moment object for easier comparison
                    const selectedDateTime = moment(date);
                    const oneHourFromNow = moment().add(1, "hour");

                    // Check if the date/time is at least 1 hour in the future
                    if (selectedDateTime.isBefore(oneHourFromNow)) {
                      return t("duration.selectFutureDate", { ns: "leases" });
                    }
                  },
                ],
                condition: {
                  when: "expiryDateEnabled",
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
                  when: "expiryDateEnabled",
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
                label: t("duration.durationThresholds", { ns: "leases" }),
                description: t("duration.durationThresholdsDescription", { ns: "leases" }),
                thresholdType: "duration",
                validate: [thresholdValidator("duration")],
                showError: true,
                condition: {
                  when: "expiryDateEnabled",
                  is: true,
                  then: {
                    visible: true,
                  },
                },
              },
            ],
          },
        ],
      }}
    />
  );
};
