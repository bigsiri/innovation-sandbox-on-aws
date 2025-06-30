// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Button,
  ButtonDropdown,
  ContentLayout,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";

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
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatDistanceToNowLocalized } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const DateRequestedCell = ({ lease, currentLanguage }: { lease: Lease; currentLanguage: string }) => (
  <>{formatDistanceToNowLocalized(new Date(lease.meta?.createdTime || ''), currentLanguage as any)}</>
);

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
  currentLanguage: string;
};

const createColumnDefinitions = (includeLinks: boolean, t: any, currentLanguage: string) => [
  {
    id: "requestor",
    header: t('table.columns.requestedBy'),
    sortingField: "requestor.name",
    cell: (
      lease: Lease, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
    ) => <RequestorCell lease={lease} includeLinks={includeLinks} />,
  },
  {
    id: "originalLeaseTemplateName",
    header: t('table.columns.leaseTemplate'),
    sortingField: "originalLeaseTemplateName",
    cell: (lease: Lease) => lease.originalLeaseTemplateName,
  },
  {
    id: "dateRequested",
    header: t('table.columns.requested'),
    sortingField: "dateRequested",
    cell: (lease: Lease) => <DateRequestedCell lease={lease} currentLanguage={currentLanguage} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "comments",
    header: t('table.columns.comments'),
    sortingField: "comments",
    cell: (lease: Lease) => <CommentsCell lease={lease} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
];

const ReviewModalContent = ({
  selectedRequests,
  mode,
  reviewLease,
  t,
  currentLanguage,
}: ReviewModalContentProps) => {
  return (
    <BatchActionReview
      items={selectedRequests}
      description={t('review.description', { 
        replace: { count: selectedRequests.length } 
      })}
      columnDefinitions={createColumnDefinitions(false, t, currentLanguage)}
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
            ? t('review.success.approved')
            : t('review.success.denied'),
        );
      }}
      onError={() =>
        showErrorToast(
          t('review.error.message'),
          t('review.error.title'),
        )
      }
    />
  );
};

export const ListApprovals = () => {
  const { t, currentLanguage } = useTranslation('approvals');
  
  // base ui hooks
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();

  // modal hook
  const { showModal } = useModal();

  // state
  const [selectedRequests, setSelectedRequests] = useState<Lease[]>([]);

  // api hooks
  const { data: requests, isFetching, refetch } = useGetPendingApprovals();
  const { mutateAsync: reviewLease } = useReviewLease();

  const init = async () => {
    setBreadcrumb([
      { text: t('breadcrumbs.home', { ns: 'navigation' }), href: "/" },
      { text: t('breadcrumbs.approvals', { ns: 'navigation' }), href: "/approvals" },
    ]);
    setTools(<Markdown file="approvals" />);
  };

  useEffect(() => {
    init();
  }, []);

  const showReviewModal = (mode: "approve" | "deny") => {
    showModal({
      header: mode === "approve" 
        ? t('modal.approve.title')
        : t('modal.deny.title'),
      content: (
        <ReviewModalContent
          selectedRequests={selectedRequests}
          mode={mode}
          reviewLease={reviewLease}
          t={t}
          currentLanguage={currentLanguage}
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
          description={t('page.description')}
        >
          {t('page.title')}
        </Header>
      }
    >
      <Table
        stripedRows
        trackBy="leaseId"
        columnDefinitions={createColumnDefinitions(true, t, currentLanguage)}
        header={t('table.title')}
        totalItemsCount={(requests || []).length}
        items={requests || []}
        selectedItems={selectedRequests}
        onSelectionChange={handleSelectionChange}
        loading={isFetching}
        loadingText={t('actions.loading', { ns: 'common' })}
        empty={t('actions.noItemsFound', { ns: 'common' })}
        // Force re-render with key to ensure translation updates
        key={`table-${currentLanguage}`}
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
                { 
                  text: t('actions.approve'), 
                  id: "approve" 
                },
                { 
                  text: t('actions.deny'), 
                  id: "deny" 
                },
              ]}
              onItemClick={({ detail }) => {
                showReviewModal(detail.id === "approve" ? "approve" : "deny");
              }}
            >
              {t('actions.title')}
            </ButtonDropdown>
          </SpaceBetween>
        }
      />
    </ContentLayout>
  );
};
