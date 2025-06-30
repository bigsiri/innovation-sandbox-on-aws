// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValuePair } from "@aws-northstar/ui";
import {
  Alert,
  Box,
  Container,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";

import { BudgetStatus } from "@amzn/innovation-sandbox-frontend/components/BudgetStatus";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetLeaseTemplateById } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

type ReviewTemplateProps = {
  data: { leaseTemplateUuid: string };
};

export const ReviewTemplate = (props: ReviewTemplateProps) => {
  const { t } = useTranslation();

  const {
    data: leaseTemplate,
    isLoading,
    isError,
    error,
  } = useGetLeaseTemplateById(props.data.leaseTemplateUuid);

  if (isLoading) {
    return <Loader data-testid="loader" />;
  }

  if (isError) {
    return (
      <Alert type="error">
        {t('forms.request.review.errorLoading', { ns: 'leases' })}{" "}
        {error instanceof Error ? error.message : t('forms.request.review.unknownError', { ns: 'leases' })}
      </Alert>
    );
  }

  if (!leaseTemplate) {
    return null;
  }

  return (
    <SpaceBetween size="s">
      <KeyValuePair
        label={t('forms.request.review.templateSelected', { ns: 'leases' })}
        value={
          <Box margin={{ top: "xs" }}>
            <Container>
              <SpaceBetween size="xs">
                <Box>
                  <Box>
                    <strong>{leaseTemplate.name}</strong>
                  </Box>
                  <Box>
                    <small>{leaseTemplate.description}</small>
                  </Box>
                </Box>

                <Box data-muted>
                  <strong>{t('forms.request.review.expires', { ns: 'leases' })} </strong>
                  <DurationStatus
                    durationInHours={leaseTemplate.leaseDurationInHours}
                  />
                </Box>
                <Box data-muted>
                  <strong>{t('forms.request.review.budgetMax', { ns: 'leases' })} </strong>
                  <BudgetStatus maxSpend={leaseTemplate.maxSpend} />
                </Box>
                <Box>
                  {!leaseTemplate.requiresApproval ? (
                    <StatusIndicator type="success">
                      {t('forms.request.review.noApprovalRequired', { ns: 'leases' })}
                    </StatusIndicator>
                  ) : (
                    <StatusIndicator type="warning">
                      {t('forms.request.review.approvalRequired', { ns: 'leases' })}
                    </StatusIndicator>
                  )}
                </Box>
              </SpaceBetween>
            </Container>
          </Box>
        }
      />
    </SpaceBetween>
  );
};
