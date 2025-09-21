import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  Badge,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";
import { getLocalizedMoment } from "@amzn/innovation-sandbox-frontend/helpers/moment";

import { SharedLease } from "@amzn/innovation-sandbox-frontend/domains/leases/service";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { useLeaseStatusDisplayName } from "@amzn/innovation-sandbox-frontend/domains/leases/helpers";

interface SharedLeaseCardProps {
  lease: SharedLease;
}

export const SharedLeaseCard = ({ lease }: SharedLeaseCardProps) => {
  const { t } = useTranslation('home');
  const moment = getLocalizedMoment();
  const getStatusDisplayName = useLeaseStatusDisplayName();

  const getStatusBadge = (status: string) => {
    const colorMap = {
      Active: "green" as const,
      PendingApproval: "blue" as const,
      Frozen: "red" as const,
      Expired: "grey" as const,
      BudgetExceeded: "red" as const,
      ManuallyTerminated: "grey" as const,
    };

    const color = colorMap[status as keyof typeof colorMap] || "grey" as const;
    return <Badge color={color}>{getStatusDisplayName(status as any)}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (hours: number) => {
    return moment.duration(hours, "hours").humanize();
  };

  const getActionButton = () => {
    if (lease.status === "Active" && lease.awsAccountId) {
      return (
        <AccountLoginLink 
          variant="normal" 
          accountId={lease.awsAccountId} 
        />
      );
    }
    
    return (
      <Button
        variant="normal"
        href={`/leases/${lease.leaseId}`}
        external={false}
      >
        {t("sharedLeases.viewDetails")}
      </Button>
    );
  };

  return (
    <Container
      header={
        <Header
          variant="h3"
          actions={getActionButton()}
        >
          {lease.originalLeaseTemplateName}
        </Header>
      }
    >
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("sharedLeases.status")}</Box>
          <div>{getStatusBadge(lease.status)}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("sharedLeases.account")}</Box>
          <div>{lease.awsAccountId || t("sharedLeases.notYetAssigned")}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("sharedLeases.sharedBy")}</Box>
          <div>{lease.ownerEmail}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("table.budget")}</Box>
          <div>{formatCurrency(lease.maxSpend)}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("sharedLeases.duration")}</Box>
          <div>{formatDuration(lease.leaseDurationInHours)}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">{t("sharedLeases.sharedOn")}</Box>
          <div>{formatDate(lease.sharedAt)}</div>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
};
