// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { InfoPanel } from "@amzn/innovation-sandbox-frontend/components/InfoPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SharedLeaseCard } from "./SharedLeaseCard";
import { useGetSharedLeases } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

export const SharedLeasesSection = () => {
  const {
    data: sharedLeasesData,
    isFetching,
    isError,
    refetch,
    error,
  } = useGetSharedLeases({
    limit: 20,
    status: "Active", // Only show active shared leases
    includeOwned: false,
  });

  const sharedLeases = sharedLeasesData?.leases || [];

  const body = () => {
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
        <InfoPanel
          header="You currently don't have any shared leases."
          description="When someone shares an active lease with you, it will appear here."
        />
      );
    }

    return (
      <SpaceBetween size="xl">
        {sharedLeases.map((lease) => (
          <SharedLeaseCard key={lease.leaseId} lease={lease} />
        ))}
      </SpaceBetween>
    );
  };

  const count = () => {
    if (!isFetching && !isError) {
      return <span data-counter>({sharedLeases.length})</span>;
    }
  };

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        description="View active leases shared with you"
        actions={
          <Button
            iconName="refresh"
            ariaLabel="Refresh"
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        Shared Leases {count()}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
