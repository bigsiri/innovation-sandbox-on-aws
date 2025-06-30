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
} from "@cloudscape-design/components";

import {
  isExpiredLease,
  isMonitoredLease,
  LeaseWithLeaseId,
  MonitoredLease,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { Divider } from "@amzn/innovation-sandbox-frontend/components/Divider";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface LeasePanelProps {
  lease: LeaseWithLeaseId;
}

export const LeasePanel = ({ lease }: LeasePanelProps) => {
  const { t } = useTranslation();

  return (
    <Container data-shadow>
      <SpaceBetween size="l">
        <Header
          variant="h3"
          actions={
            <>
              {lease.status === "Active" && (
                <AccountLoginLink
                  accountId={lease.awsAccountId}
                  variant="normal"
                />
              )}

              {lease.status === "PendingApproval" && (
                <StatusIndicator type="info">
                  {t('leasePanel.pendingApproval', { ns: 'home' })}
                </StatusIndicator>
              )}
            </>
          }
          description={<LeaseStatusBadge lease={lease} />}
        >
          {lease.originalLeaseTemplateName || `Lease ${lease.uuid}`}
        </Header>
        <Divider marginBottom="s" />
        <ColumnLayout columns={4} variant="text-grid">
          <Box>
            <FormField label={t('leasePanel.awsAccountId', { ns: 'home' })} />
            {isMonitoredLease(lease) ? (
              lease.awsAccountId
            ) : (
              <StatusIndicator type="warning">
                {lease.status === "PendingApproval" 
                  ? t('leasePanel.noAccountAssignedYet', { ns: 'home' })
                  : t('leasePanel.noAccountAssigned', { ns: 'home' })
                }
              </StatusIndicator>
            )}
          </Box>

          <Box>
            <FormField label={t('leasePanel.expiry', { ns: 'home' })} />
            <DurationStatus
              date={(lease as MonitoredLease).expirationDate}
              durationInHours={lease.leaseDurationInHours}
            />
          </Box>

          <Box>
            <FormField label={t('leasePanel.budget', { ns: 'home' })} />
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
