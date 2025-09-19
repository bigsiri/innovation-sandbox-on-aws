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
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetPendingApprovals } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

export const ApprovalsPanel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
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
          <Loader label={t("approvals.checkingApprovals")} />
        </Container>
      );
    }

    if (isError || !approvals) {
      return (
        <ErrorPanel
          description={t("approvals.approvalsCouldNotBeLoaded")}
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if (approvals.length === 0) {
      return (
        <Alert type="success">{t("approvals.noPendingApprovals")}</Alert>
      );
    }

    return (
      <Alert type="warning" header={t("approvals.pendingApprovalsHeader")}>
        <Box margin={{ top: "xs" }}>
          {approvals.length === 1 ? (
            <>
              {t("approvals.thereIs")} <strong>1</strong> {t("approvals.pendingApproval")}.
            </>
          ) : (
            <>
              {t("approvals.thereAre")} <strong>{approvals.length}</strong> {t("approvals.pendingApprovals")}.
            </>
          )}
        </Box>
        <Box margin={{ top: "s" }}>
          <Button onClick={() => navigate("/approvals")}>{t("actions.viewAllApprovals")}</Button>
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
            ariaLabel={t("actions.refresh")}
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        {t("sections.approvals")}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
