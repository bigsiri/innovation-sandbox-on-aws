// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  ButtonDropdown,
  CollectionPreferences,
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
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import { DurationStatus } from "@amzn/innovation-sandbox-frontend/components/DurationStatus";
import { BudgetProgressBar } from "@amzn/innovation-sandbox-frontend/components/BudgetProgressBar";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
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
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { LeaseStatusBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseStatusBadge";
import {
  useLeaseStatusDisplayName,
  leaseStatusSortingComparator,
} from "@amzn/innovation-sandbox-frontend/domains/leases/helpers";
import {
  useFreezeLease,
  useGetLeases,
  useTerminateLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
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

const AccessCell = ({ lease }: { lease: Lease }) => (
  <>
    {isMonitoredLease(lease) && (
      <AccountLoginLink accountId={lease.awsAccountId} />
    )}
  </>
);

const BudgetCell = ({ lease, t }: { lease: Lease; t: any }) => {
  return isMonitoredLease(lease) || isExpiredLease(lease) ? (
    <BudgetProgressBar
      currentValue={lease.totalCostAccrued}
      maxValue={lease.maxSpend}
    />
  ) : (
    t("table.cells.noCostsAccrued", { ns: "leases" })
  );
};

const ExpiryCell = ({ lease, t }: { lease: Lease; t: any }) => {
  if (isPendingLease(lease) || isApprovalDeniedLease(lease)) {
    return <DurationStatus durationInHours={lease.leaseDurationInHours} />;
  } else if (isMonitoredLease(lease)) {
    return lease.expirationDate ? (
      <DurationStatus
        date={lease.expirationDate}
        durationInHours={lease.leaseDurationInHours}
      />
    ) : (
      <StatusIndicator type="info">{t("table.cells.noExpiry", { ns: "leases" })}</StatusIndicator>
    );
  } else if (isExpiredLease(lease)) {
    return <DurationStatus date={lease.endDate} expired={true} />;
  }
  return null;
};

const AwsAccountCell = ({ lease, t }: { lease: Lease; t: any }) =>
  isMonitoredLease(lease) || isExpiredLease(lease) ? (
    lease.awsAccountId
  ) : (
    <StatusIndicator type="warning">{t("table.cells.noAccountAssigned", { ns: "leases" })}</StatusIndicator>
  );

const createColumnDefinitions = (includeLinks: boolean, t: any) => [
  {
    id: "user",
    header: t("table.headers.user", { ns: "leases" }),
    sortingField: "userEmail",
    cell: (lease: Lease) => <UserCell lease={lease} includeLinks={includeLinks} />,
  },
  {
    id: "originalLeaseTemplateName", 
    header: t("table.headers.leaseTemplate", { ns: "leases" }),
    sortingField: "originalLeaseTemplateName",
    cell: (lease: Lease) => lease.originalLeaseTemplateName,
  },
  {
    id: "budget",
    header: t("table.headers.budget", { ns: "leases" }),
    sortingField: "totalCostAccrued",
    cell: (lease: Lease) => <BudgetCell lease={lease} t={t} />,
  },
  {
    id: "expirationDate",
    header: t("table.headers.expiry", { ns: "leases" }),
    sortingField: "expirationDate", 
    cell: (lease: Lease) => <ExpiryCell lease={lease} t={t} />,
  },
  {
    id: "status",
    header: t("table.headers.status", { ns: "leases" }),
    sortingComparator: leaseStatusSortingComparator,
    cell: (lease: Lease) => <LeaseStatusBadge lease={lease} />,
  },
  {
    id: "awsAccountId",
    header: t("table.headers.awsAccount", { ns: "leases" }),
    sortingField: "awsAccountId",
    cell: (lease: Lease) => <AwsAccountCell lease={lease} t={t} />,
  },
  {
    id: "link", 
    header: t("table.headers.access", { ns: "leases" }),
    cell: (lease: Lease) => <AccessCell lease={lease} />,
  },
].filter((column) => includeLinks || column.id !== "link");

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
      description={`${selectedLeases.length} ${action === "terminate" ? t("modal.terminateDescription", { ns: "leases" }) : t("modal.freezeDescription", { ns: "leases" })}`}
      columnDefinitions={columnDefinitions}
      identifierKey="leaseId"
      onSubmit={async (lease: Lease) => {
        await onAction(lease.leaseId);
      }}
      onSuccess={() => {
        showSuccessToast(
          action === "terminate" ? t("messages.leasesTerminatedSuccessfully", { ns: "leases" }) : t("messages.leasesFrozenSuccessfully", { ns: "leases" })
        );
      }}
      onError={() =>
        showErrorToast(t("messages.actionFailed", { ns: "leases" }))
      }
    />
  );
};

export const ListLeases = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getLeaseStatusDisplayName = useLeaseStatusDisplayName();
  const { setTools } = useAppLayoutContext();
  const setBreadcrumb = useBreadcrumb();
  const { showModal } = useModal();

  // Create filter options with translations
  const filterOptions: SelectProps.Options = [
    {
      label: t("filterGroups.active", { ns: "leases" }),
      options: MonitoredLeaseStatusSchema.options.map((status: string) => ({
        label: getLeaseStatusDisplayName(status as LeaseStatus),
        value: status,
      })),
    },
    {
      label: t("filterGroups.pending", { ns: "leases" }),
      options: [
        {
          label: getLeaseStatusDisplayName(PendingLeaseStatusSchema.value),
          value: PendingLeaseStatusSchema.value,
        },
      ],
    },
    {
      label: t("filterGroups.expired", { ns: "leases" }),
      options: [
        ...ExpiredLeaseStatusSchema.options,
        ApprovalDeniedLeaseStatusSchema.value,
      ].map((status) => ({
        label: getLeaseStatusDisplayName(status as LeaseStatus),
        value: status,
      })),
    },
  ];

  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [selectedLeases, setSelectedLeases] = useState<Lease[]>([]);
  const [leaseTemplates, setLeaseTemplates] = useState<SelectProps.Options>([]);
  const [filteringText, setFilteringText] = useState("");

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
      { text: t("page.home", { ns: "leases" }), href: "/" },
      { text: t("page.title", { ns: "leases" }), href: "/leases" },
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

    // filter by search text
    const filteredByText = filteringText
      ? filterByLeaseTemplate.filter((lease) =>
          lease.userEmail.toLowerCase().includes(filteringText.toLowerCase()) ||
          lease.originalLeaseTemplateName.toLowerCase().includes(filteringText.toLowerCase()) ||
          (isMonitoredLease(lease) && lease.awsAccountId && lease.awsAccountId.toLowerCase().includes(filteringText.toLowerCase()))
        )
      : filterByLeaseTemplate;

    return filteredByText;
  };

  const handleSelectionChange = ({ detail }: any) => {
    setSelectedLeases(detail.selectedItems);
  };

  const showTerminateModal = () => {
    showModal({
      header: t("modal.terminateTitle", { ns: "leases" }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="terminate"
          onAction={terminateLease}
          t={t}
          columnDefinitions={createColumnDefinitions(false, t)}
        />
      ),
    });
  };

  const showFreezeModal = () => {
    showModal({
      header: t("modal.freezeTitle", { ns: "leases" }),
      content: (
        <ActionModalContent
          selectedLeases={selectedLeases}
          action="freeze"
          onAction={freezeLease}
          t={t}
          columnDefinitions={createColumnDefinitions(false, t)}
        />
      ),
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (filterOptions.length > 0 && statusFilter.length === 0) {
      // Set default status filter to active leases
      setStatusFilter((filterOptions[0] as SelectProps.OptionGroup).options);
    }
  }, [filterOptions, statusFilter.length]);

  useEffect(() => {
    if (leases) {
      const filtered = filterLeases(leases);
      setFilteredLeases(filtered);

      // Extract unique lease template names for filter
      const uniqueTemplates = Array.from(
        new Set(leases.map((lease) => lease.originalLeaseTemplateName)),
      );
      setLeaseTemplates(
        uniqueTemplates.map((template) => ({
          label: template,
          value: template,
        })),
      );
    }
  }, [leases, statusFilter, leaseTemplateFilter, filteringText]);

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="leases" />}
          description={t("page.description", { ns: "leases" })}
        >
          {t("page.title", { ns: "leases" })}
        </Header>
      }
    >
      <SpaceBetween size="s">
        <Container header={<Header variant="h3">{t("filters.title", { ns: "leases" })}</Header>}>
          <ColumnLayout columns={3}>
            <Box>
              <FormField label={t("filters.status", { ns: "leases" })} />
              <Multiselect
                data-testid="status-filter"
                selectedOptions={statusFilter}
                onChange={({ detail }) =>
                  setStatusFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={filterOptions}
                placeholder={t("filters.chooseOptions", { ns: "leases" })}
              />
            </Box>
            <Box>
              <FormField label={t("filters.leaseTemplate", { ns: "leases" })} />
              <Multiselect
                selectedOptions={leaseTemplateFilter}
                onChange={({ detail }) =>
                  setLeaseTemplateFilter(
                    detail.selectedOptions as MultiselectProps.Option[],
                  )
                }
                options={leaseTemplates}
                placeholder={t("filters.chooseOptions", { ns: "leases" })}
                loadingText={t("filters.loading", { ns: "leases" })}
                empty={t("filters.noLeasesFound", { ns: "leases" })}
                statusType={isFetching ? "loading" : undefined}
              />
            </Box>
          </ColumnLayout>
        </Container>
        <Table
          stripedRows
          trackBy="leaseId"
          columnDefinitions={createColumnDefinitions(true, t)}
          items={filteredLeases || []}
          selectedItems={selectedLeases}
          onSelectionChange={handleSelectionChange}
          selectionType="multi"
          loading={isFetching}
          loadingText={t("filters.loading", { ns: "leases" })}
          empty={t("table.noItemsToDisplay", { ns: "leases" })}
          filter={
            <TextFilter
              filteringPlaceholder={t("searchPlaceholder", { ns: "leases" })}
              filteringText={filteringText}
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
              filteringAriaLabel={t("filteringAriaLabel", { ns: "leases" })}
            />
          }
          preferences={
            <CollectionPreferences
              title={t("preferences", { ns: "leases" })}
              confirmLabel={t("confirm", { ns: "leases" })}
              cancelLabel={t("cancel", { ns: "leases" })}
              preferences={{
                pageSize: 10,
                wrapLines: false,
                stripedRows: true,
                visibleContent: ["user", "originalLeaseTemplateName", "budget", "expirationDate", "status", "awsAccountId", "link"]
              }}
              pageSizePreference={{
                title: t("selectPageSize", { ns: "leases" }),
                options: [
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 50, label: "50" }
                ]
              }}
              wrapLinesPreference={{
                label: t("wrapLines", { ns: "leases" }),
                description: t("wrapLinesDescription", { ns: "leases" })
              }}
              stripedRowsPreference={{
                label: t("stripedRows", { ns: "leases" }),
                description: t("stripedRowsDescription", { ns: "leases" })
              }}
              visibleContentPreference={{
                title: t("selectVisibleColumns", { ns: "leases" }),
                options: [
                  { 
                    label: t("mainProperties", { ns: "leases" }),
                    options: [
                      { id: "user", label: t("table.headers.user", { ns: "leases" }) },
                      { id: "originalLeaseTemplateName", label: t("table.headers.leaseTemplate", { ns: "leases" }) },
                      { id: "budget", label: t("table.headers.budget", { ns: "leases" }) },
                      { id: "expirationDate", label: t("table.headers.expiry", { ns: "leases" }) },
                      { id: "status", label: t("table.headers.status", { ns: "leases" }) },
                      { id: "awsAccountId", label: t("table.headers.awsAccount", { ns: "leases" }) },
                      { id: "link", label: t("table.headers.access", { ns: "leases" }) }
                    ]
                  }
                ]
              }}
            />
          }
          header={
            <Header
              counter={`(${filteredLeases?.length || 0})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    iconName="refresh"
                    ariaLabel={t("actions.refresh", { ns: "leases" })}
                    onClick={() => refetch()}
                    disabled={isFetching}
                  />
                  <ButtonDropdown
                    disabled={selectedLeases.length === 0}
                    items={[
                      {
                        text: t("actions.terminate", { ns: "leases" }),
                        id: "terminate",
                        disabled: !selectedLeases.every(
                          (lease) =>
                            lease.status === "Active" || lease.status === "Frozen",
                        ),
                        disabledReason: t("actionReasons.onlyActiveOrFrozenCanTerminate", { ns: "leases" }),
                      },
                      {
                        text: t("actions.freeze", { ns: "leases" }),
                        id: "freeze",
                        disabled: !selectedLeases.every(
                          (lease) => lease.status === "Active",
                        ),
                        disabledReason: t("actionReasons.onlyActiveCanFreeze", { ns: "leases" }),
                      },
                      {
                        text: t("actions.update", { ns: "leases" }),
                        id: "update",
                        disabled: selectedLeases.length > 1,
                        disabledReason: t("actionReasons.onlySingleCanUpdate", { ns: "leases" }),
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
                    {t("actions.actions", { ns: "leases" })}
                  </ButtonDropdown>
                </SpaceBetween>
              }
            >
              {t("page.title", { ns: "leases" })}
            </Header>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
};
