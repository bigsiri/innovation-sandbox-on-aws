// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  Header,
  SpaceBetween,
  Tabs,
  TabsProps,
  Box,
} from "@cloudscape-design/components";
import { useState } from "react";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SharedLeaseCard } from "./SharedLeaseCard";
import { useGetSharedLeases } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

export const SharedLeasesSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const {
    data: sharedLeasesData,
    isFetching,
    isError,
    refetch,
    error,
  } = useGetSharedLeases({
    limit: 20,
    status: activeTab === "all" ? undefined : activeTab,
    includeOwned: false,
  });

  const sharedLeases = sharedLeasesData?.leases || [];

  const getTabContent = () => {
    if (isFetching) {
      return <Loader label="Loading shared leases..." />;
    }

    if (isError) {
      return (
        <ErrorPanel
          description="Shared leases could not be loaded."
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if (sharedLeases.length === 0) {
      return (
        <Box textAlign="center" color="text-body-secondary">
          <SpaceBetween size="s">
            <div><strong>No shared leases available</strong></div>
            <div>When someone shares a lease with you, it will appear here.</div>
          </SpaceBetween>
        </Box>
      );
    }

    return (
      <SpaceBetween size="m">
        {sharedLeases.map((lease) => (
          <SharedLeaseCard key={lease.leaseId} lease={lease} />
        ))}
      </SpaceBetween>
    );
  };

  const tabs: TabsProps.Tab[] = [
    {
      label: "All",
      id: "all",
      content: getTabContent(),
    },
    {
      label: "Active",
      id: "Active",
      content: getTabContent(),
    },
    {
      label: "Pending",
      id: "PendingApproval",
      content: getTabContent(),
    },
  ];

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="View leases shared with you by other users"
          counter={`(${sharedLeases.length})`}
        >
          Shared Leases
        </Header>
      }
    >
      <Tabs
        tabs={tabs}
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
      />
    </Container>
  );
};
