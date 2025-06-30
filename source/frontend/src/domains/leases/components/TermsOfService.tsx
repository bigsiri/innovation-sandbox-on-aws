// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Container,
  SpaceBetween,
} from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const TermsOfService = () => {
  const { t } = useTranslation();

  const {
    data: config,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetConfigurations();

  if (isLoading) {
    return <Loader label={t('forms.request.termsOfService.loadingText', { ns: 'leases' })} />;
  }

  if (isError) {
    return (
      <ErrorPanel
        description={t('forms.request.termsOfService.loadError', { ns: 'leases' })}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  return (
    <SpaceBetween size="s">
      <Box variant="strong">
        {t('forms.request.termsOfService.reviewText', { ns: 'leases' })}
      </Box>
      <Container>
        {config?.termsOfService ? (
          <pre>{config.termsOfService}</pre>
        ) : (
          <Alert
            type="warning"
            header={t('forms.request.termsOfService.notConfiguredHeader', { ns: 'leases' })}
          >
            {t('forms.request.termsOfService.notConfiguredMessage', { ns: 'leases' })}
          </Alert>
        )}
      </Container>
    </SpaceBetween>
  );
};
