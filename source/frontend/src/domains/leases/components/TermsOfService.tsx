// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Container,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const TermsOfService = () => {
  const { t } = useTranslation('leases');
  const {
    data: config,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetConfigurations();

  if (isLoading) {
    return <Loader label={t('request.terms.loading')} />;
  }

  if (isError) {
    return (
      <ErrorPanel
        description={t('request.terms.loadError')}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  return (
    <SpaceBetween size="s">
      <Box variant="strong">
        {t('request.terms.reviewMessage')}
      </Box>
      <Container>
        {config?.termsOfService ? (
          <pre>{config.termsOfService}</pre>
        ) : (
          <Alert
            type="warning"
            header={t('request.terms.notConfiguredHeader')}
          >
            {t('request.terms.notConfiguredMessage')}
          </Alert>
        )}
      </Container>
    </SpaceBetween>
  );
};
