// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const LeaseSettings = () => {
  const { t } = useTranslation(['settings', 'common']);
  const {
    data: config,
    isLoading,
    isError: loadingError,
    refetch,
    error,
  } = useGetConfigurations();

  if (isLoading) {
    return <Loader />;
  }

  if (loadingError || !config) {
    return (
      <ErrorPanel
        description={t("loadingError")}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  return (
    <SettingsContainer>
      <KeyValuePairs
        columns={3}
        items={[
          {
            type: "group",
            title: t("lease.budget.title"),
            items: [
              {
                label: t("lease.budget.maxBudget"),
                value: `$${config.leases.maxBudget} USD`,
              },
              {
                label: t("lease.budget.requireMaxBudget"),
                value: config.leases.requireMaxBudget ? t("yes", { ns: "common" }) : t("no", { ns: "common" }),
              },
            ],
          },
          {
            type: "group",
            title: t("lease.duration.title"),
            items: [
              {
                label: t("lease.duration.maxDuration"),
                value: t("lease.duration.hoursValue", { hours: config.leases.maxDurationHours }),
              },
              {
                label: t("lease.duration.requireMaxDuration"),
                value: config.leases.requireMaxDuration ? t("yes", { ns: "common" }) : t("no", { ns: "common" }),
              },
            ],
          },
          {
            type: "group",
            title: t("lease.userLimits.title"),
            items: [
              {
                label: t("lease.userLimits.maxLeasesPerUser"),
                value: config.leases.maxLeasesPerUser,
              },
            ],
          },
        ]}
      />
    </SettingsContainer>
  );
};
