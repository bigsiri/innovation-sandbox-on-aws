// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { InfoPanel } from "@amzn/innovation-sandbox-frontend/components/InfoPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SharedLeaseCard } from "./SharedLeaseCard";
import { useGetSharedLeases } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

export const SharedLeasesSection = () => {
  const { t } = useTranslation('home');
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
      return <Loader label={t("sharedLeases.loadingSharedLeases")} />;
    }

    if (isError) {
      return (
        <ErrorPanel
          description={t("sharedLeases.sharedLeasesCouldNotBeLoaded")}
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if (sharedLeases.length === 0) {
      return (
        <InfoPanel
          header={t("sharedLeases.noSharedLeasesHeader")}
          description={t("sharedLeases.noSharedLeasesDescription")}
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
        description={t("sharedLeases.sharedLeasesDescription")}
        actions={
          <Button
            iconName="refresh"
            ariaLabel={t("actions.refresh")}
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        {t("sections.sharedSandboxes")} {count()}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
