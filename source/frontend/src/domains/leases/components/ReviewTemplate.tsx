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
import { useTranslation } from "react-i18next";

import { BudgetStatus } from "@amzn/innovation-sandbox-frontend/components/BudgetStatus";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetLeaseTemplateById } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";

type ReviewTemplateProps = {
  data: { leaseTemplateUuid: string };
};

export const ReviewTemplate = (props: ReviewTemplateProps) => {
  const { t } = useTranslation('leases');
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
        {t('request.review.errorLoading')}{" "}
        {error instanceof Error ? error.message : t('request.review.unknownError')}
      </Alert>
    );
  }

  if (!leaseTemplate) {
    return null;
  }

  return (
    <SpaceBetween size="s">
      <KeyValuePair
        label={t('request.review.templateSelected')}
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
                  <strong>{t('request.review.expires')} </strong>
                  <DurationStatus
                    durationInHours={leaseTemplate.leaseDurationInHours}
                  />
                </Box>
                <Box data-muted>
                  <strong>{t('request.review.maxBudget')} </strong>
                  <BudgetStatus maxSpend={leaseTemplate.maxSpend} />
                </Box>
                <Box>
                  {!leaseTemplate.requiresApproval ? (
                    <StatusIndicator type="success">
                      {t('request.review.noApprovalRequired')}
                    </StatusIndicator>
                  ) : (
                    <StatusIndicator type="warning">
                      {t('request.review.requiresApproval')}
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
