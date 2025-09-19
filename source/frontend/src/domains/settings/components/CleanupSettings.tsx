// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePairs, StatusIndicator } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const CleanupSettings = () => {
  const { t } = useTranslation(['settings']);
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
        columns={2}
        items={[
          {
            label: t("cleanup.waitBeforeRerun"),
            value: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds ? (
              <>
                {t("cleanup.secondsValue", { seconds: config.cleanup.waitBeforeRerunSuccessfulAttemptSeconds })}
              </>
            ) : (
              <StatusIndicator type="warning">{t("general.notSet")}</StatusIndicator>
            ),
          },

          {
            label: t("cleanup.failedAttemptsToCancel"),
            value: config.cleanup.numberOfFailedAttemptsToCancelCleanup ? (
              <>{config.cleanup.numberOfFailedAttemptsToCancelCleanup}</>
            ) : (
              <StatusIndicator type="warning">{t("general.notSet")}</StatusIndicator>
            ),
          },
          {
            label: t("cleanup.waitBeforeRetry"),
            value: config.cleanup.waitBeforeRetryFailedAttemptSeconds ? (
              <>{t("cleanup.secondsValue", { seconds: config.cleanup.waitBeforeRetryFailedAttemptSeconds })}</>
            ) : (
              <StatusIndicator type="warning">{t("general.notSet")}</StatusIndicator>
            ),
          },
          {
            label: t("cleanup.successfulAttemptsToFinish"),
            value: config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup ? (
              <>{config.cleanup.numberOfSuccessfulAttemptsToFinishCleanup}</>
            ) : (
              <StatusIndicator type="warning">{t("general.notSet")}</StatusIndicator>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};
