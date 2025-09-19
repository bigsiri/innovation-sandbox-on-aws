// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  ColumnLayout,
  Container,
  FormField,
  Header,
  SpaceBetween,
  StatusIndicator,
  Button,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  isExpiredLease,
  isMonitoredLease,
  LeaseWithLeaseId,
  MonitoredLease,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import { useGetLeaseTemplateById } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { AuthService } from "@amzn/innovation-sandbox-frontend/helpers/AuthService";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

interface LeasePanelProps {
  lease: LeaseWithLeaseId;
}

export const LeasePanel = ({ lease }: LeasePanelProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IsbUser>();
  const { t } = useTranslation('home');

  // Get lease template to check user management permission
  const { data: leaseTemplate } = useGetLeaseTemplateById(
    lease.originalLeaseTemplateUuid || ""
  );

  // Get current user
  useInit(async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  });

  // Check if user can manage users on this lease
  const canManageUsers = () => {
    if (!user) return false;
    
    // Managers and Admins can always manage users
    if (user.roles?.includes("Admin") || user.roles?.includes("Manager")) {
      return true;
    }
    
    // Lease owners can manage users only if the template allows it
    if (lease.userEmail === user.email) {
      return leaseTemplate?.allowOwnerUserManagement !== false; // Default to true if not set
    }
    
    return false;
  };

  const getActions = () => {
    const actions = [];

    if (lease.status === "Active") {
      actions.push(
        <AccountLoginLink
          key="login"
          accountId={lease.awsAccountId}
          variant="normal"
        />
      );
    }

    if (lease.status === "Active" && canManageUsers()) {
      actions.push(
        <Button
          key="manage-users"
          variant="normal"
          onClick={() => navigate(`/leases/edit/${lease.leaseId}?tab=users`)}
        >
          {t("actions.manageUsers")}
        </Button>
      );
    }

    if (lease.status === "PendingApproval") {
      actions.push(
        <StatusIndicator key="pending" type="info">
          {t("status.accountPendingApproval")}
        </StatusIndicator>
      );
    }

    return actions;
  };

  const getUsersCount = () => {
    const count = (lease.users?.length || 0) + 1;
    return `${count} ${count === 1 ? t("table.user") : t("table.users")}`;
  };

  return (
    <Container data-shadow>
      <SpaceBetween size="l">
        <Header
          variant="h3"
          actions={<SpaceBetween direction="horizontal" size="xs">{getActions()}</SpaceBetween>}
          description={<LeaseStatusBadge lease={lease} />}
        >
          {lease.originalLeaseTemplateName || `${t("leases.lease")} ${lease.uuid}`}
        </Header>
        <Divider marginBottom="s" />
        <ColumnLayout columns={4} variant="text-grid">
          <Box>
            <FormField label={t("table.awsAccountId")} />
            {isMonitoredLease(lease) ? (
              lease.awsAccountId
            ) : (
              <StatusIndicator type="warning">
                {t("status.noAccountAssigned")}{" "}
                {lease.status === "PendingApproval" && t("status.noAccountAssignedYet")}
              </StatusIndicator>
            )}
          </Box>

          <Box>
            <FormField label={t("table.users")} />
            <div>{getUsersCount()}</div>
          </Box>

          <Box>
            <FormField label={t("table.expiry")} />
            <DurationStatus
              date={(lease as MonitoredLease).expirationDate}
              durationInHours={lease.leaseDurationInHours}
            />
          </Box>

          <Box>
            <FormField label={t("table.budget")} />
            <SpaceBetween size="m">
              <BudgetProgressBar
                currentValue={
                  isMonitoredLease(lease) || isExpiredLease(lease)
                    ? lease.totalCostAccrued
                    : 0
                }
                maxValue={lease.maxSpend}
              />
            </SpaceBetween>
          </Box>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
};
