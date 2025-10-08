// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  ColumnLayout,
  Container,
  CopyToClipboard,
  FormField,
  Header,
  Modal,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
import { UserSearchInput } from "@amzn/innovation-sandbox-frontend/domains/leases/components/user-search";
import { getLocalizedMoment } from "@amzn/innovation-sandbox-frontend/helpers/moment";

interface LeaseSummaryProps {
  lease: Lease;
  canReassignOwner?: boolean;
  onReassignOwner?: (newOwnerEmail: string) => void;
  isUpdating?: boolean;
}

export const LeaseSummary = ({ 
  lease, 
  canReassignOwner = false, 
  onReassignOwner,
  isUpdating = false 
}: LeaseSummaryProps) => {
  const { t } = useTranslation();
  const moment = getLocalizedMoment();
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ email: string; displayName?: string } | null>(null);
  
  const isPending = isPendingLease(lease);
  const isMonitored = isMonitoredLease(lease);
  const isExpired = isExpiredLease(lease);
  const isMonitoredOrExpired = isMonitored || isExpired;

  const renderTimePopover = (date: string) => (
    <Popover
      position="top"
      size="large"
      dismissButton={false}
      content={moment(date).format("lll")}
    >
      <Box>{moment(date).fromNow()}</Box>
    </Popover>
  );

  const handleReassignOwner = () => {
    if (selectedUser && onReassignOwner) {
      onReassignOwner(selectedUser.email);
      setShowReassignModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Container header={<Header>{t("summary.title", { ns: "leases" })}</Header>}>
        <ColumnLayout columns={2}>
          <SpaceBetween size="l">
            <Box>
              <FormField label={t("summary.fields.leaseId", { ns: "leases" })} />
              <CopyToClipboard
                variant="inline"
                textToCopy={lease.uuid}
                copySuccessText={t("summary.copySuccess.leaseId", { ns: "leases" })}
                copyErrorText={t("summary.copyError.leaseId", { ns: "leases" })}
              />
            </Box>
            <Box>
              <FormField label={t("summary.fields.awsAccountId", { ns: "leases" })} />
              {isMonitoredOrExpired ? (
                <CopyToClipboard
                  variant="inline"
                  textToCopy={lease.awsAccountId}
                  copySuccessText={t("summary.copySuccess.awsAccountId", { ns: "leases" })}
                  copyErrorText={t("summary.copyError.awsAccountId", { ns: "leases" })}
                />
              ) : (
                <StatusIndicator type="warning">
                  {t("summary.status.noAccountAssigned", { ns: "leases" })}
                </StatusIndicator>
              )}
            </Box>
            <Box>
              <FormField label={t("summary.fields.leaseTemplate", { ns: "leases" })} />
              <Box>{lease.originalLeaseTemplateName}</Box>
            </Box>
            <Box>
              <FormField label={t("summary.fields.requestedBy", { ns: "leases" })} />
              <SpaceBetween direction="horizontal" size="s" alignItems="center">
                <Box>{lease.userEmail}</Box>
                {canReassignOwner && (
                  <Button 
                    variant="link" 
                    iconName="edit"
                    onClick={() => setShowReassignModal(true)}
                    disabled={isUpdating}
                  >
                    {t("actions.reassignOwner", { ns: "leases" })}
                  </Button>
                )}
              </SpaceBetween>
            </Box>
            {isMonitoredOrExpired && (
              <Box>
                <FormField label={t("summary.fields.approvedBy", { ns: "leases" })} />
                <Box>
                  {lease.approvedBy === "AUTO_APPROVED" ? (
                    <StatusIndicator type="success">
                      {t("summary.status.autoApproved", { ns: "leases" })}
                    </StatusIndicator>
                  ) : (
                    lease.approvedBy
                  )}
                </Box>
              </Box>
            )}
            <Box>
              <FormField label={t("summary.fields.status", { ns: "leases" })} />
              <Box>
                <LeaseStatusBadge lease={lease} />
              </Box>
            </Box>
          </SpaceBetween>
          <SpaceBetween size="l">
            <Box>
              <FormField label={isPending ? t("summary.fields.maxBudget", { ns: "leases" }) : t("summary.fields.budgetStatus", { ns: "leases" })} />
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
                <FormField label={t("summary.fields.leaseStarted", { ns: "leases" })} />
                {renderTimePopover(lease.startDate)}
              </Box>
            )}

            <Box>
              <FormField label={t("summary.fields.leaseExpiry", { ns: "leases" })} />
              <DurationStatus
                date={isMonitoredOrExpired ? lease.expirationDate : undefined}
                durationInHours={lease.leaseDurationInHours}
              />
            </Box>

            {isMonitoredOrExpired && (
              <Box>
                <FormField label={t("summary.fields.lastMonitored", { ns: "leases" })} />
                {renderTimePopover(lease.lastCheckedDate)}
              </Box>
            )}

            <Box>
              <FormField label={t("summary.fields.comments", { ns: "leases" })} />
              {lease.comments ? (
                lease.comments
              ) : (
                <StatusIndicator type="info">
                  {t("summary.status.noComments", { ns: "leases" })}
                </StatusIndicator>
              )}
            </Box>
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      <Modal
        visible={showReassignModal}
        onDismiss={() => {
          setShowReassignModal(false);
          setSelectedUser(null);
        }}
        header={t("modal.reassignOwner.title", { ns: "leases" })}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="link" 
                onClick={() => {
                  setShowReassignModal(false);
                  setSelectedUser(null);
                }}
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleReassignOwner}
                disabled={!selectedUser || isUpdating}
                loading={isUpdating}
              >
                {t("actions.reassignOwner", { ns: "leases" })}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            <strong>{t("modal.reassignOwner.currentOwner", { ns: "leases" })}</strong> {lease.userEmail}
          </Box>
          <FormField label={t("modal.reassignOwner.newOwner", { ns: "leases" })}>
            <UserSearchInput
              onUserSelect={setSelectedUser}
              placeholder={t("modal.reassignOwner.searchPlaceholder", { ns: "leases" })}
              disabled={isUpdating}
            />
          </FormField>
          {selectedUser && (
            <Box>
              <strong>{t("modal.reassignOwner.selected", { ns: "leases" })}</strong> {selectedUser.displayName || selectedUser.email}
            </Box>
          )}
        </SpaceBetween>
      </Modal>
    </>
  );
};
