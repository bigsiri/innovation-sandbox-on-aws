// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs } from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/i18n/utils/numberLocalization";

export const LeaseSettings = () => {
  const { t, currentLanguage } = useTranslation();
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
        description={t('page.error', { ns: 'settings' })}
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
            title: t('lease.budget.title', { ns: 'settings' }),
            items: [
              {
                label: t('lease.budget.maxBudget.label', { ns: 'settings' }),
                value: formatCurrency(config.leases.maxBudget, { currency: 'USD' }, currentLanguage),
              },
              {
                label: t('lease.budget.requireMaxBudget.label', { ns: 'settings' }),
                value: t(config.leases.requireMaxBudget ? 'yes' : 'no', { ns: 'common' }),
              },
            ],
          },
          {
            type: "group",
            title: t('lease.duration.title', { ns: 'settings' }),
            items: [
              {
                label: t('lease.duration.maxDuration.label', { ns: 'settings' }),
                value: `${config.leases.maxDurationHours} ${t('lease.duration.maxDuration.unit', { ns: 'settings' })}`,
              },
              {
                label: t('lease.duration.requireMaxDuration.label', { ns: 'settings' }),
                value: t(config.leases.requireMaxDuration ? 'yes' : 'no', { ns: 'common' }),
              },
            ],
          },
          {
            type: "group",
            title: t('lease.userLimits.title', { ns: 'settings' }),
            items: [
              {
                label: t('lease.userLimits.maxLeasesPerUser.label', { ns: 'settings' }),
                value: config.leases.maxLeasesPerUser,
              },
            ],
          },
        ]}
      />
    </SettingsContainer>
  );
};
