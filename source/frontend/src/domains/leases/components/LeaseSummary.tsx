// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  ColumnLayout,
  Container,
  CopyToClipboard,
  FormField,
  Header,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";

import {
  isExpiredLease,
  isMonitoredLease,
  isPendingLease,
  Lease,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { BudgetStatus } from "@amzn/innovation-sandbox-frontend/components/BudgetStatus";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatDate, formatDistanceToNowLocalized } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";

export const LeaseSummary = ({ lease }: { lease: Lease }) => {
  const { t, currentLanguage } = useTranslation('leases');
  const isPending = isPendingLease(lease);
  const isMonitored = isMonitoredLease(lease);
  const isExpired = isExpiredLease(lease);
  const isMonitoredOrExpired = isMonitored || isExpired;

  const renderTimePopover = (date: string) => (
    <Popover
      position="top"
      size="large"
      dismissButton={false}
      content={formatDate(new Date(date), 'full', currentLanguage)}
    >
      <Box>{formatDistanceToNowLocalized(new Date(date), currentLanguage)}</Box>
    </Popover>
  );

  return (
    <Container header={<Header>{t('summary.title')}</Header>}>
      <ColumnLayout columns={2}>
        <SpaceBetween size="l">
          <Box>
            <FormField label={t('details.leaseId')} />
            <CopyToClipboard
              variant="inline"
              textToCopy={lease.uuid}
              copySuccessText={t('summary.copySuccess.leaseId')}
              copyErrorText={t('summary.copyError.leaseId')}
            />
          </Box>
          <Box>
            <FormField label={t('details.awsAccountId')} />
            {isMonitoredOrExpired ? (
              <CopyToClipboard
                variant="inline"
                textToCopy={lease.awsAccountId}
                copySuccessText={t('summary.copySuccess.accountId')}
                copyErrorText={t('summary.copyError.accountId')}
              />
            ) : (
              <StatusIndicator type="warning">
                {t('details.noAccountAssigned')}
              </StatusIndicator>
            )}
          </Box>
          <Box>
            <FormField label={t('details.leaseTemplate')} />
            <Box>{lease.originalLeaseTemplateName}</Box>
          </Box>
          <Box>
            <FormField label={t('details.requestedBy')} />
            <Box>{lease.userEmail}</Box>
          </Box>
          {isMonitoredOrExpired && (
            <Box>
              <FormField label={t('details.approvedBy')} />
              <Box>
                {lease.approvedBy === "AUTO_APPROVED" ? (
                  <StatusIndicator type="success">
                    {t('details.autoApproved')}
                  </StatusIndicator>
                ) : (
                  lease.approvedBy
                )}
              </Box>
            </Box>
          )}
          <Box>
            <FormField label={t('details.status')} />
            <Box>
              <LeaseStatusBadge lease={lease} />
            </Box>
          </Box>
        </SpaceBetween>
        <SpaceBetween size="l">
          <Box>
            <FormField 
              label={isPending 
                ? t('details.maxBudget') 
                : t('details.budgetStatus')
              } 
            />
            {isPending ? (
              <BudgetStatus maxSpend={lease.maxSpend} />
            ) : (
              <BudgetProgressBar
                currentValue={
                  !isMonitoredOrExpired ? 0 : lease.totalCostAccrued
                }
                maxValue={lease.maxSpend}
              />
            )}
          </Box>

          {isMonitoredOrExpired && (
            <Box>
              <FormField label={t('details.leaseStarted')} />
              {renderTimePopover(lease.startDate)}
            </Box>
          )}

          <Box>
            <FormField label={t('details.leaseExpiry')} />
            <DurationStatus
              date={isMonitoredOrExpired ? lease.expirationDate : undefined}
              durationInHours={lease.leaseDurationInHours}
            />
          </Box>

          {isMonitoredOrExpired && (
            <Box>
              <FormField label={t('details.lastMonitored')} />
              {renderTimePopover(lease.lastCheckedDate)}
            </Box>
          )}

          <Box>
            <FormField label={t('details.comments')} />
            {lease.comments ? (
              lease.comments
            ) : (
              <StatusIndicator type="info">
                {t('details.noComments')}
              </StatusIndicator>
            )}
          </Box>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
};
