// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetPendingApprovals } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const ApprovalsPanel = () => {
  const { t } = useTranslation('approvals');
  const navigate = useNavigate();
  const {
    data: approvals,
    isFetching,
    isError,
    refetch,
    error,
  } = useGetPendingApprovals();

  const body = () => {
    if (isFetching) {
      return (
        <Container>
          <Loader label={t('widgets.approvals.loading', { ns: 'home' })} />
        </Container>
      );
    }

    if (isError || !approvals) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return (
        <ErrorPanel
          description={`Approvals can't be retrieved at the moment. Server error: ${errorMessage}`}
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if (approvals.length === 0) {
      return (
        <Alert type="success">
          {t('widgets.approvals.noPending', { ns: 'home' })}
        </Alert>
      );
    }

    return (
      <Alert type="warning" header={t('widgets.approvals.pendingTitle', { ns: 'home' })}>
        <Box margin={{ top: "xs" }}>
          {approvals.length === 1 ? (
            t('widgets.approvals.pendingSingle', { 
              ns: 'home', 
              replace: { count: approvals.length } 
            })
          ) : (
            t('widgets.approvals.pendingMultiple', { 
              ns: 'home', 
              replace: { count: approvals.length } 
            })
          )}
        </Box>
        <Box margin={{ top: "s" }}>
          <Button onClick={() => navigate("/approvals")}>
            {t('widgets.approvals.viewApprovals', { ns: 'home' })}
          </Button>
        </Box>
      </Alert>
    );
  };

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        actions={
          <Button
            iconName="refresh"
            ariaLabel={t('actions.refresh', { ns: 'home' })}
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        {t('widgets.approvals.title', { ns: 'home' })}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
