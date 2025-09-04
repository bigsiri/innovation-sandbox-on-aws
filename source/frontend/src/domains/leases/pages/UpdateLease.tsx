// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentLayout, Header, Tabs } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { isMonitoredLease } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { UsersTab } from "@amzn/innovation-sandbox-frontend/domains/leases/components/users/UsersTab";
import {
  LeaseDurationForm,
  LeaseDurationFormData,
} from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseDurationForm";
import { LeaseSummary } from "@amzn/innovation-sandbox-frontend/domains/leases/components/LeaseSummary";
import { generateBreadcrumb } from "@amzn/innovation-sandbox-frontend/domains/leases/helpers";
import {
  useGetLeaseById,
  useUpdateLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { LeasePatchRequest } from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import {
  BudgetForm,
  BudgetFormData,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/components/BudgetForm";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useGetLeaseTemplateById } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { AuthService } from "@amzn/innovation-sandbox-frontend/helpers/AuthService";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

export const UpdateLease = () => {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<IsbUser>();
  const [activeTabId, setActiveTabId] = useState(searchParams.get("tab") || "summary");

  // get leaseTemplate hook
  const query = useGetLeaseById(leaseId!);
  const { data: lease, isLoading, isError, refetch } = query;

  // get lease template
  const { data: leaseTemplate, isLoading: isLoadingTemplate } = useGetLeaseTemplateById(
    lease?.originalLeaseTemplateUuid || ""
  );

  // update leaseTemplate hook
  const { mutateAsync: updateLease, isPending: isUpdating } = useUpdateLease();

  // get global settings
  const {
    data: config,
    isLoading: isLoadingConfig,
    isError: isConfigError,
    refetch: refetchConfig,
    error,
  } = useGetConfigurations();

  // Get current user
  useInit(async () => {
    const currentUser = await AuthService.getCurrentUser();
    setUser(currentUser);
  });

  // Check if user has access to this lease
  const hasAccess = () => {
    if (!user || !lease) return false;
    
    // Admins and Managers can access any lease
    if (user.roles?.includes("Admin") || user.roles?.includes("Manager")) {
      return true;
    }
    
    // Lease owners can access their own leases
    if (lease.userEmail === user.email) {
      return true;
    }
    
    // Users can access leases they're added to
    return lease.users?.some(leaseUser => leaseUser.userEmail === user.email) || false;
  };

  // Check if user is admin or manager
  const isManagerOrAdmin = () => {
    return user?.roles?.includes("Admin") || user?.roles?.includes("Manager");
  };

  // update breadcrumb with lease details
  useEffect(() => {
    const breadcrumb = generateBreadcrumb(query);
    setBreadcrumb(breadcrumb);
  }, [query.isLoading]);

  if (isLoading || isLoadingConfig || isLoadingTemplate || !user) {
    return <Loader />;
  }

  if (isError || !lease) {
    return (
      <ErrorPanel
        description="There was a problem loading this lease."
        retry={refetch}
        error={error as Error}
      />
    );
  }

  // Check access control
  if (!hasAccess()) {
    return (
      <ErrorPanel
        description="You don't have permission to access this lease."
        error={new Error("Access denied")}
      />
    );
  }

  if (isConfigError) {
    return (
      <ErrorPanel
        description="There was a problem loading global configuration settings."
        retry={refetchConfig}
        error={error as Error}
      />
    );
  }

  // call api to update lease budget fields
  const onUpdateBudget = async (data: any) => {
    // get data from form
    const { maxSpend, budgetThresholds, maxBudgetEnabled } =
      data as BudgetFormData;

    // create patch api request
    const leasePatchRequest: LeasePatchRequest = {
      leaseId: lease.leaseId,
      budgetThresholds,
      maxSpend: maxBudgetEnabled ? maxSpend : null,
    };

    await updateLease(leasePatchRequest);
    showSuccessToast("Lease updated successfully.");
  };

  // call api to update lease duration fields
  const onUpdateDuration = async (data: any) => {
    // get data from form
    const { expirationDate, durationThresholds, expiryDateEnabled } =
      data as LeaseDurationFormData;

    // create patch api request
    const leasePatchRequest: LeasePatchRequest = {
      leaseId: lease.leaseId,
      durationThresholds: expiryDateEnabled ? durationThresholds : [],
      expirationDate: expiryDateEnabled ? expirationDate : null,
    };

    await updateLease(leasePatchRequest);
    showSuccessToast("Lease updated successfully.");
  };

  const onCancel = () => {
    navigate("/leases");
  };

  // Check if user can manage users
  const canManageUsers = () => {
    // Managers and Admins can always manage users
    if (isManagerOrAdmin()) {
      return true;
    }
    
    // Lease owners can manage users only if the template allows it
    if (lease.userEmail === user?.email) {
      return leaseTemplate?.allowOwnerUserManagement !== false; // Default to true if not set
    }
    
    return false;
  };

  const body = () => {
    if (!isMonitoredLease(lease)) {
      // if lease is not active, don't show tabs for budget/duration
      return <LeaseSummary lease={lease} />;
    }

    // Build tabs based on user role and template settings
    const tabs = [
      {
        label: "Summary",
        id: "summary",
        content: <LeaseSummary lease={lease} />,
      },
    ];

    // Add Users tab if user has permission
    if (canManageUsers()) {
      tabs.push({
        label: "Users",
        id: "users",
        content: (
          <UsersTab
            leaseId={lease.leaseId}
            currentUserEmail={user?.email}
            isLeaseActive={lease.status === "Active"}
          />
        ),
      });
    }

    // Only show Budget and Duration tabs for Managers and Admins
    if (isManagerOrAdmin()) {
      tabs.splice(-1, 0, // Insert before Users tab (or at end if no Users tab)
        {
          label: "Budget",
          id: "budget",
          content: (
            <BudgetForm
              maxSpend={lease.maxSpend}
              budgetThresholds={lease.budgetThresholds}
              onSubmit={onUpdateBudget}
              onCancel={onCancel}
              isUpdating={isUpdating}
              globalMaxBudget={config?.leases.maxBudget}
            />
          ),
        },
        {
          label: "Duration",
          id: "duration",
          content: (
            <LeaseDurationForm
              expirationDate={lease.expirationDate}
              durationThresholds={lease.durationThresholds}
              onSubmit={onUpdateDuration}
              onCancel={onCancel}
              isUpdating={isUpdating}
            />
          ),
        }
      );
    }

    return (
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={tabs}
      />
    );
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={<>{lease?.originalLeaseTemplateName}</>}
        >
          {lease.userEmail}
        </Header>
      }
    >
      {body()}
    </ContentLayout>
  );
};
