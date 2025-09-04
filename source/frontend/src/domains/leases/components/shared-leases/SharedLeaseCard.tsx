import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  Badge,
} from "@cloudscape-design/components";

import { SharedLease } from "@amzn/innovation-sandbox-frontend/domains/leases/service";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";

interface SharedLeaseCardProps {
  lease: SharedLease;
}

export const SharedLeaseCard = ({ lease }: SharedLeaseCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      Active: { color: "green" as const, text: "Active" },
      PendingApproval: { color: "blue" as const, text: "Pending Approval" },
      Frozen: { color: "red" as const, text: "Frozen" },
      Expired: { color: "grey" as const, text: "Expired" },
      BudgetExceeded: { color: "red" as const, text: "Budget Exceeded" },
      ManuallyTerminated: { color: "grey" as const, text: "Terminated" },
    };

    const { color, text } = statusMap[status as keyof typeof statusMap] || { color: "grey" as const, text: status };
    return <Badge color={color}>{text}</Badge>;
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
        View Details
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
          <Box variant="awsui-key-label">Status</Box>
          <div>{getStatusBadge(lease.status)}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">Account</Box>
          <div>{lease.awsAccountId || "Not yet assigned"}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">Shared by</Box>
          <div>{lease.ownerEmail}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">Budget</Box>
          <div>{formatCurrency(lease.maxSpend)}</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">Duration</Box>
          <div>{lease.leaseDurationInHours} hours</div>
        </SpaceBetween>

        <SpaceBetween size="xs">
          <Box variant="awsui-key-label">Shared on</Box>
          <div>{formatDate(lease.sharedAt)}</div>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  );
};
