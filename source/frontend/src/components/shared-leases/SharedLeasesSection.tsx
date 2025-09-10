// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  Header,
  SpaceBetween,
  Box,
} from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
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

  if (isFetching) {
    return (
      <Container
        header={
          <Header variant="h2" description="AWS accounts shared with you">
            Shared Leases
          </Header>
        }
      >
        <Loader label="Loading shared leases..." />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container
        header={
          <Header variant="h2" description="AWS accounts shared with you">
            Shared Leases
          </Header>
        }
      >
        <ErrorPanel
          description="Shared leases could not be loaded."
          retry={refetch}
          error={error as Error}
        />
      </Container>
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Active AWS accounts shared with you"
          counter={`(${sharedLeases.length})`}
        >
          Shared Leases
        </Header>
      }
    >
      {sharedLeases.length === 0 ? (
        <Box textAlign="center" color="text-body-secondary">
          <SpaceBetween size="s">
            <div><strong>No shared leases available</strong></div>
            <div>When someone shares an active lease with you, it will appear here.</div>
          </SpaceBetween>
        </Box>
      ) : (
        <SpaceBetween size="m">
          {sharedLeases.map((lease) => (
            <SharedLeaseCard key={lease.leaseId} lease={lease} />
          ))}
        </SpaceBetween>
      )}
    </Container>
  );
};
