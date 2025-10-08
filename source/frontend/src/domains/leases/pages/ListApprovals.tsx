// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  ButtonDropdown,
  CollectionPreferences,
  ContentLayout,
  Header,
  SpaceBetween,
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { LeaseWithLeaseId as Lease } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useGetPendingApprovals,
  useReviewLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { getLocalizedMoment } from "@amzn/innovation-sandbox-frontend/helpers/moment";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const DateRequestedCell = ({ lease }: { lease: Lease }) => {
  const moment = getLocalizedMoment();
  return <>{moment(lease.meta?.createdTime).fromNow()}</>;
};

const CommentsCell = ({ lease }: { lease: Lease }) => <>{lease.comments}</>;

const RequestorCell = ({
  lease,
  includeLinks,
}: {
  lease: Lease;
  includeLinks: boolean;
}) =>
  includeLinks ? (
    <TextLink to={`/approvals/${lease.leaseId}`}>{lease.userEmail}</TextLink>
  ) : (
    lease.userEmail
  );

// Review modal content component
type ReviewModalContentProps = {
  selectedRequests: Lease[];
  mode: "approve" | "deny";
  reviewLease: (params: { leaseId: string; approve: boolean }) => Promise<any>;
  t: any;
};

const createColumnDefinitions = (includeLinks: boolean, t: any) => [
  {
    id: "requestor",
    header: t("table.headers.requestedBy"),
    sortingField: "requestor.name",
    cell: (
      lease: Lease, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
    ) => <RequestorCell lease={lease} includeLinks={includeLinks} />,
  },
  {
    id: "originalLeaseTemplateName",
    header: t("table.headers.leaseTemplate"),
    sortingField: "originalLeaseTemplateName",
    cell: (lease: Lease) => lease.originalLeaseTemplateName,
  },
  {
    id: "dateRequested",
    header: t("table.headers.requested"),
    sortingField: "dateRequested",
    cell: (lease: Lease) => <DateRequestedCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "comments",
    header: t("table.headers.comments"),
    sortingField: "comments",
    cell: (lease: Lease) => <CommentsCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
];

const ReviewModalContent = ({
  selectedRequests,
  mode,
  reviewLease,
  t,
}: ReviewModalContentProps) => {
  return (
    <BatchActionReview
      items={selectedRequests}
      description={t('leaseRequestsToReview', { count: selectedRequests.length, ns: 'leases' })}
      columnDefinitions={createColumnDefinitions(false, t)}
      identifierKey="leaseId"
      onSubmit={async (lease: Lease) => {
        await reviewLease({
          leaseId: lease.leaseId,
          approve: mode === "approve",
        });
      }}
      onSuccess={() => {
        showSuccessToast(
          mode === "approve"
            ? "Lease request(s) were successfully approved."
            : "Lease request(s) were successfully denied.",
        );
      }}
      onError={() =>
        showErrorToast(
          "One or more lease requests failed to review, try resubmitting.",
          "Failed to review lease requests",
        )
      }
    />
  );
};

export const ListApprovals = () => {
  // base ui hooks
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();
  const { t, i18n } = useTranslation(['approvals']);

  // Set moment locale based on current language
  useEffect(() => {
    if (i18n.language === 'fr-CA') {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  }, [i18n.language]);

  // modal hook
  const { showModal } = useModal();

  // state
  const [selectedRequests, setSelectedRequests] = useState<Lease[]>([]);
  const [filteringText, setFilteringText] = useState("");

  // api hooks
  const { data: requests, isFetching, refetch } = useGetPendingApprovals();
  const { mutateAsync: reviewLease } = useReviewLease();

  // Filter requests based on search text
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (!filteringText) return requests;
    
    return requests.filter(request =>
      request.userEmail.toLowerCase().includes(filteringText.toLowerCase()) ||
      request.originalLeaseTemplateName.toLowerCase().includes(filteringText.toLowerCase()) ||
      (request.comments && request.comments.toLowerCase().includes(filteringText.toLowerCase()))
    );
  }, [requests, filteringText]);

  const init = async () => {
    setBreadcrumb([
      { text: t("common.home"), href: "/" },
      { text: t("approvals"), href: "/approvals" },
    ]);
    setTools(<Markdown file="approvals" />);
  };

  useEffect(() => {
    init();
  }, []);

  const showReviewModal = (mode: "approve" | "deny") => {
    showModal({
      header: mode === "approve" ? t("approveRequests") : t("denyRequests"),
      content: (
        <ReviewModalContent
          selectedRequests={selectedRequests}
          mode={mode}
          reviewLease={reviewLease}
          t={t}
        />
      ),
      size: "max",
    });
  };

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    const approvals = detail.selectedItems as Lease[];
    setSelectedRequests(approvals);
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="approvals" />}
          description={t("pageDescription")}
        >
          {t("approvals")}
        </Header>
      }
    >
      <Table
        stripedRows
        trackBy="leaseId"
        columnDefinitions={createColumnDefinitions(true, t)}
        items={filteredRequests || []}
        selectedItems={selectedRequests}
        onSelectionChange={handleSelectionChange}
        selectionType="multi"
        loading={isFetching}
        loadingText={t("loading")}
        empty={t("table.noItemsToDisplay")}
        filter={
          <TextFilter
            filteringPlaceholder={t("filteringPlaceholder")}
            filteringText={filteringText}
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
            filteringAriaLabel={t("filteringAriaLabel")}
          />
        }
        header={
          <Header
            counter={`(${filteredRequests?.length || 0})`}
            actions={
              <SpaceBetween direction="horizontal" size="s">
                <Button
                  iconName="refresh"
                  onClick={() => refetch()}
                  disabled={isFetching}
                />
                <ButtonDropdown
                  disabled={selectedRequests.length === 0}
                  items={[
                    { text: t("approveRequests"), id: "approve" },
                    { text: t("denyRequests"), id: "deny" },
                  ]}
                  onItemClick={({ detail }) => {
                    showReviewModal(detail.id === "approve" ? "approve" : "deny");
                  }}
                >
                  {t("actionsButton")}
                </ButtonDropdown>
              </SpaceBetween>
            }
          >
            {t("approvals")}
          </Header>
        }
        preferences={
          <CollectionPreferences
            title={t("preferences")}
            confirmLabel={t("confirm")}
            cancelLabel={t("cancel")}
            preferences={{
              pageSize: 10,
              wrapLines: false,
              stripedRows: true,
              visibleContent: ["requestor", "originalLeaseTemplateName", "dateRequested", "comments"]
            }}
            pageSizePreference={{
              title: t("selectPageSize"),
              options: [
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 50, label: "50" }
              ]
            }}
            wrapLinesPreference={{
              label: t("wrapLines"),
              description: t("wrapLinesDescription")
            }}
            stripedRowsPreference={{
              label: t("stripedRows"),
              description: t("stripedRowsDescription")
            }}
            visibleContentPreference={{
              title: t("selectVisibleColumns"),
              options: [
                { 
                  label: t("mainProperties"),
                  options: [
                    { id: "requestor", label: t("table.headers.requestedBy") },
                    { id: "originalLeaseTemplateName", label: t("table.headers.leaseTemplate") },
                    { id: "dateRequested", label: t("table.headers.requested") },
                    { id: "comments", label: t("table.headers.comments") }
                  ]
                }
              ]
            }}
          />
        }
      />
    </ContentLayout>
  );
};
