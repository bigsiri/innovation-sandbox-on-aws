// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs, StatusIndicator } from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const CleanupSettings = () => {
  const { t } = useTranslation();
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
        columns={2}
        items={[
          {
            label: t('cleanup.waitBeforeRerun.label', { ns: 'settings' }),
            value: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds ? (
              <>
                {config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds} {t('cleanup.waitBeforeRerun.unit', { ns: 'settings' })}
              </>
            ) : (
              <StatusIndicator type="warning">
                {t('cleanup.waitBeforeRerun.notSet', { ns: 'settings' })}
              </StatusIndicator>
            ),
          },

          {
            label: t('cleanup.failedAttempts.label', { ns: 'settings' }),
            value: config.cleanup.numberOfFailedAttemptsToCancelCleanup ? (
              <>{config.cleanup.numberOfFailedAttemptsToCancelCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                {t('cleanup.failedAttempts.notSet', { ns: 'settings' })}
              </StatusIndicator>
            ),
          },
          {
            label: t('cleanup.waitBeforeRetry.label', { ns: 'settings' }),
            value: config.cleanup.waitBeforeRetryFailedAttemptSeconds ? (
              <>{config.cleanup.waitBeforeRetryFailedAttemptSeconds} {t('cleanup.waitBeforeRetry.unit', { ns: 'settings' })}</>
            ) : (
              <StatusIndicator type="warning">
                {t('cleanup.waitBeforeRetry.notSet', { ns: 'settings' })}
              </StatusIndicator>
            ),
          },
          {
            label: t('cleanup.successfulAttempts.label', { ns: 'settings' }),
            value: config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup ? (
              <>{config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup}</>
            ) : (
              <StatusIndicator type="warning">
                {t('cleanup.successfulAttempts.notSet', { ns: 'settings' })}
              </StatusIndicator>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};
