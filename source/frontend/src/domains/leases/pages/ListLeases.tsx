// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Box,
  Button,
  ButtonDropdown,
  ColumnLayout,
  Container,
  ContentLayout,
  FormField,
  Header,
  Multiselect,
  MultiselectProps,
  SelectProps,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ApprovalDeniedLeaseStatusSchema,
  ExpiredLeaseStatusSchema,
  isApprovalDeniedLease,
  isExpiredLease,
  isMonitoredLease,
  isPendingLease,
  LeaseWithLeaseId as Lease,
  LeaseStatus,
  MonitoredLeaseStatusSchema,
  PendingLeaseStatusSchema,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import {
  getLeaseStatusDisplayName,
  leaseStatusSortingComparator,
} from "@amzn/innovation-sandbox-frontend/domains/leases/helpers";
import {
  useFreezeLease,
  useGetLeases,
  useTerminateLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const UserCell = ({
  lease,
  includeLinks,
}: {
  lease: Lease;
  includeLinks: boolean;
}) =>
  includeLinks ? (
    <TextLink to={`/leases/edit/${lease.leaseId}`}>{lease.userEmail}</TextLink>
  ) : (
    lease.userEmail
  );

const BudgetCell = ({ lease }: { lease: Lease }) => {
  return isMonitoredLease(lease) || isExpiredLease(lease) ? (
    <BudgetProgressBar
      currentValue={lease.totalCostAccrued}
      maxValue={lease.maxSpend}
    />
  ) : (
    "No costs accrued"
  );
};

const AccessCell = ({ lease }: { lease: Lease }) => (
  <>
    {isMonitoredLease(lease) && (
      <AccountLoginLink accountId={lease.awsAccountId} />
    )}
  </>
);

type ActionModalContentProps = {
  selectedLeases: Lease[];
  action: "terminate" | "freeze";
  onAction: (leaseId: string) => Promise<any>;
  t: any;
  columnDefinitions: any[];
};

const ActionModalContent = ({
  selectedLeases,
  action,
  onAction,
  t,
  columnDefinitions,
}: ActionModalContentProps) => {
  return (
    <BatchActionReview
      items={selectedLeases}
      description={t(`actions.modal.${action}.description`, { count: selectedLeases.length })}
      columnDefinitions={columnDefinitions}
      identifierKey="leaseId"
      onSubmit={async (lease: Lease) => {
        await onAction(lease.leaseId);
      }}
      onSuccess={() => {
        showSuccessToast(
          t(`actions.success.${action}`),
        );
      }}
      onError={() =>
        showErrorToast(
          t(`actions.error.${action}.message`),
          t(`actions.error.${action}.title`),
        )
      }
    />
  );
};

export const ListLeases = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Move these components inside to access translation functions
  const ExpiryCell = ({ lease }: { lease: Lease }) => {
    if (isPendingLease(lease) || isApprovalDeniedLease(lease)) {
      return <DurationStatus durationInHours={lease.leaseDurationInHours} />;
    } else if (isMonitoredLease(lease)) {
      return lease.expirationDate ? (
        <DurationStatus
          date={lease.expirationDate}
          durationInHours={lease.leaseDurationInHours}
        />
      ) : (
        <StatusIndicator type="info">{t('status.noExpiry', { ns: 'leases' })}</StatusIndicator>
      );
    } else if (isExpiredLease(lease)) {
      return <DurationStatus date={lease.endDate} expired={true} />;
    }
    return null;
  };

  const AwsAccountCell = ({ lease }: { lease: Lease }) =>
    isMonitoredLease(lease) || isExpiredLease(lease) ? (
      lease.awsAccountId
    ) : (
      <StatusIndicator type="warning">{t('status.noAccountAssigned', { ns: 'leases' })}</StatusIndicator>
    );

  // Reliable fallbacks for hardcoded strings



  const createColumnDefinitions = (includeLinks: boolean) =>
    [
      {
        id: "user",
        header: t('table.columns.user', { ns: 'leases' }),
        sortingField: "userEmail",
        cell: (lease: Lease) => (
          <UserCell lease={lease} includeLinks={includeLinks} />
        ), // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
      {
        id: "originalLeaseTemplateName",
        header: t('table.columns.leaseTemplate', { ns: 'leases' }),
        sortingField: "originalLeaseTemplateName",
        cell: (lease: Lease) => lease.originalLeaseTemplateName,
      },
      {
        id: "budget",
        header: t('table.columns.budget', { ns: 'leases' }),
        sortingField: "totalCostAccrued",
        cell: (lease: Lease) => <BudgetCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
      {
        id: "expirationDate",
        header: t('table.columns.expiry', { ns: 'leases' }),
        sortingField: "expirationDate",
        cell: (lease: Lease) => <ExpiryCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
      {
        id: "status",
        header: t('table.columns.status', { ns: 'leases' }),
        sortingComparator: leaseStatusSortingComparator,
        cell: (lease: Lease) => <LeaseStatusBadge lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
      {
        id: "awsAccountId",
        header: t('table.columns.awsAccount', { ns: 'leases' }),
        sortingField: "awsAccountId",
        cell: (lease: Lease) => <AwsAccountCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
      {
        id: "access",
        header: t('table.columns.access', { ns: 'leases' }),
        cell: (lease: Lease) => <AccessCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
      },
    ];

  // Create filter options with translations
  const filterOptions: SelectProps.Options = [
    {
      label: t('filters.groups.active', { ns: 'leases' }),
      options: MonitoredLeaseStatusSchema.options.map((status) => ({
        label: getLeaseStatusDisplayName(status as LeaseStatus, t),
        value: status,
      })),
    },
    {
      label: t('filters.groups.pending', { ns: 'leases' }),
      options: [
        {
          label: getLeaseStatusDisplayName(PendingLeaseStatusSchema.value, t),
          value: PendingLeaseStatusSchema.value,
        },
      ],
    },
    {
      label: t('filters.groups.expired', { ns: 'leases' }),
      options: [
        ...ExpiredLeaseStatusSchema.options,
        ApprovalDeniedLeaseStatusSchema.value,
      ].map((status) => ({
        label: getLeaseStatusDisplayName(status as LeaseStatus, t),
        value: status,
      })),
    },
  ];
  const { setTools } = useAppLayoutContext();
  const setBreadcrumb = useBreadcrumb();
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [selectedLeases, setSelectedLeases] = useState<Lease[]>([]);
  const [leaseTemplates, setLeaseTemplates] = useState<SelectProps.Options>([]);
  const { showModal } = useModal();

  // default status filter to active leases
  const [statusFilter, setStatusFilter] = useState<SelectProps.Options>(
    (filterOptions[0] as SelectProps.OptionGroup).options,
  );
  const [leaseTemplateFilter, setLeaseTemplateFilter] =
    useState<SelectProps.Options>([]);

  const { data: leases, isFetching, refetch } = useGetLeases();

  const { mutateAsync: terminateLease } = useTerminateLease();

  const { mutateAsync: freezeLease } = useFreezeLease();

  const init = async () => {
    setBreadcrumb([
      { text: t('breadcrumbs.home', { ns: 'navigation' }), href: "/" },
      { text: t('breadcrumbs.leases', { ns: 'navigation' }), href: "/leases" },
    ]);
    setTools(<Markdown file="leases" />);
  };

  const filterLeases = (leases: Lease[]) => {
    // filter by status
    const filteredByStatus =
      statusFilter.length > 0
        ? leases.filter((lease) =>
            statusFilter.map((x) => x.value).includes(lease.status),
          )
        : leases;

    // filter by lease template
    const filterByLeaseTemplate =
      leaseTemplateFilter.length > 0
        ? filteredByStatus.filter((lease) =>
            leaseTemplateFilter
              .map((x) => x.value)
              .includes(lease.originalLeaseTemplateName),
          )
        : filteredByStatus;

    return filterByLeaseTemplate;
  };

  useEffect(() => {
    if (leases) {
      // get list of unique lease template names from list of leases
      const uniqueLeaseTemplateNames: string[] = [
        ...new Set(leases.map((lease) => lease.originalLeaseTemplateName)),
      ];
      const leaseTemplateOptions: SelectProps.Options =
        uniqueLeaseTemplateNames.map((type) => ({ value: type, label: type }));

      // populate lease template filter dropdown
      setLeaseTemplates(leaseTemplateOptions);

      // update filtered list of leases
      setFilteredLeases(filterLeases(leases));
    }
  }, [leases]);

  useEffect(() => {
    // update filtered list of leases
    setFilteredLeases(filterLeases(leases ?? []));
  }, [statusFilter, leaseTemplateFilter]);

  useEffect(() => {
    init();
  }, []);

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    const approvals = detail.selectedItems as Lease[];
    setSelectedLeases(approvals);
  };

  const showTerminateModal = () => {
    showModal({
      header: t('actions.modal.terminate.title', { ns: 'leases' }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="terminate"
          onAction={terminateLease}
          t={t}
          columnDefinitions={createColumnDefinitions(false)}
        />
      ),
      size: "max",
    });
  };

  const showFreezeModal = () => {
    showModal({
      header: t('actions.modal.freeze.title', { ns: 'leases' }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="freeze"
          onAction={freezeLease}
          t={t}
          columnDefinitions={createColumnDefinitions(false)}
        />
      ),
      size: "max",
    });
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="leases" />}
          description={t('page.description', { ns: 'leases' })}
        >
          {t('page.title', { ns: 'leases' })}
        </Header>
      }
    >
      <SpaceBetween size="s">
        <Container header={<Header variant="h3">{t('filters.title', { ns: 'leases' })}</Header>}>
          <ColumnLayout columns={3}>
            <Box>
              <FormField label={t('filters.status', { ns: 'leases' })} />
              <Multiselect
                data-testid="status-filter"
                selectedOptions={statusFilter}
                onChange={({ detail }) =>
                  setStatusFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={filterOptions}
                placeholder={t('actions.chooseOptions', { ns: 'leases' })}
              />
            </Box>
            <Box>
              <FormField label={t('filters.leaseTemplate', { ns: 'leases' })} />
              <Multiselect
                selectedOptions={leaseTemplateFilter}
                onChange={({ detail }) =>
                  setLeaseTemplateFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={leaseTemplates}
                placeholder={t('actions.chooseOptions', { ns: 'leases' })}
                loadingText={t('actions.loading', { ns: 'common' })}
                empty={t('actions.noLeasesFound', { ns: 'leases' })}
                statusType={isFetching ? "loading" : undefined}
              />
            </Box>
          </ColumnLayout>
        </Container>
        <Table
          stripedRows
          trackBy="leaseId"
          columnDefinitions={createColumnDefinitions(true)}
          header={t('table.title', { ns: 'leases' })}
          totalItemsCount={(filteredLeases || []).length}
          items={filteredLeases || []}
          selectedItems={selectedLeases}
          onSelectionChange={handleSelectionChange}
          loading={isFetching}
          loadingText={t('actions.loading', { ns: 'common' })}
          empty={t('actions.noLeasesFound', { ns: 'leases' })}
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Button
                iconName="refresh"
                ariaLabel={t('actions.refresh', { ns: 'leases' })}
                onClick={() => refetch()}
                disabled={isFetching}
              />
              <ButtonDropdown
                disabled={selectedLeases.length === 0}
                items={[
                  {
                    text: t('actions.terminate', { ns: 'leases' }),
                    id: "terminate",
                    disabled: !selectedLeases.every(
                      (lease) =>
                        lease.status === "Active" || lease.status === "Frozen",
                    ),
                    disabledReason:
                      "Only active or frozen leases can be terminated.",
                  },
                  {
                    text: t('actions.freeze', { ns: 'leases' }),
                    id: "freeze",
                    disabled: !selectedLeases.every(
                      (lease) => lease.status === "Active",
                    ),
                    disabledReason: "Only active leases can be frozen.",
                  },
                  {
                    text: t('actions.update', { ns: 'leases' }),
                    id: "update",
                    disabled: selectedLeases.length > 1,
                    disabledReason:
                      "Only a single lease can be updated at a time.",
                  },
                ]}
                onItemClick={({ detail }) => {
                  switch (detail.id) {
                    case "terminate":
                      showTerminateModal();
                      break;
                    case "freeze":
                      showFreezeModal();
                      break;
                    case "update":
                      navigate(`/leases/edit/${selectedLeases[0].leaseId}`);
                      break;
                  }
                }}
              >
                Actions
              </ButtonDropdown>
            </SpaceBetween>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
};
