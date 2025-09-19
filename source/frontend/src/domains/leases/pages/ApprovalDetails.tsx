// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  ContentLayout,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { LeaseSummary } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseSummary";
import { ReviewLeaseConfirmation } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ReviewLeaseConfirmation";
import { useGetLeaseById } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";

export const ApprovalDetails = () => {
  const { t } = useTranslation();
  const { leaseId } = useParams();
  const setBreadcrumb = useBreadcrumb();

  // modal hook
  const { showModal, hideModal } = useModal();

  // get leaseTemplate hook
  const query = useGetLeaseById(leaseId!);
  const { data: lease, isLoading, isError, refetch, error } = query;

  // update breadcrumb with approval details
  useEffect(() => {
    const breadcrumbItems = [
      { text: t("breadcrumbs.home", { ns: "common" }), href: "/" },
      { text: t("breadcrumbs.approvals", { ns: "approvals" }), href: "/approvals" }
    ];

    if (query.isLoading) {
      breadcrumbItems.push({ text: t("breadcrumbs.loading", { ns: "common" }), href: "#" });
    } else if (query.isError || !lease) {
      breadcrumbItems.push({ text: t("breadcrumbs.error", { ns: "common" }), href: "#" });
    } else {
      breadcrumbItems.push({
        text: lease.userEmail,
        href: "#",
      });
    }

    setBreadcrumb(breadcrumbItems);
  }, [query.isLoading, lease, t]);

  const errorPanel = (
    <ErrorPanel
      description="There was a problem loading this lease."
      retry={refetch}
      error={error as Error}
    />
  );

  const showReviewModal = (mode: "approve" | "deny") => {
    if (!lease) {
      return errorPanel;
    }

    showModal({
      header: mode === "approve" 
        ? t("modal.approveTitle", { ns: "approvals" })
        : t("modal.denyTitle", { ns: "approvals" }),
      content: (
        <ReviewLeaseConfirmation
          mode={mode}
          leaseId={lease.leaseId}
          onCancel={hideModal}
        />
      ),
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !lease) {
    return errorPanel;
  }

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={<>{lease?.originalLeaseTemplateName}</>}
          actions={
            <SpaceBetween size="s" direction="horizontal">
              <Button
                iconName="check"
                onClick={() => showReviewModal("approve")}
              >
                {t("actions.approve", { ns: "approvals" })}
              </Button>
              <Button iconName="close" onClick={() => showReviewModal("deny")}>
                {t("actions.deny", { ns: "approvals" })}
              </Button>
            </SpaceBetween>
          }
        >
          {lease.userEmail}
        </Header>
      }
    >
      <LeaseSummary lease={lease} />
    </ContentLayout>
  );
};
