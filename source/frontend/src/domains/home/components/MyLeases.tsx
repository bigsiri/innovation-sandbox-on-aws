// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Button, Header, SpaceBetween } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";

import {
  isApprovalDeniedLease,
  isExpiredLease,
  isMonitoredLease,
  isPendingLease,
  LeaseWithLeaseId,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { InfoPanel } from "@amzn/innovation-sandbox-frontend/components/InfoPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { LeasePanel } from "@amzn/innovation-sandbox-frontend/domains/home/components/LeasePanel";
import { getLeasesForCurrentUser } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import moment from "moment";
import { useMemo } from "react";

export const MyLeases = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: leases,
    isFetching,
    isError,
    refetch,
    error,
  } = getLeasesForCurrentUser();

  const filteredLeases = useMemo(() => {
    const DAYS_OF_LEASE_HISTORY = 7;
    return leases
      ?.filter((lease) => {
        if (isApprovalDeniedLease(lease)) {
          return (
            moment().diff(lease.meta?.lastEditTime, "days") <=
            DAYS_OF_LEASE_HISTORY
          );
        } else if (isExpiredLease(lease)) {
          return moment().diff(lease.endDate, "days") <= DAYS_OF_LEASE_HISTORY;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        // Helper function to get sort priority
        const getStatusPriority = (lease: LeaseWithLeaseId) => {
          if (isMonitoredLease(lease)) {
            return 1;
          } else if (isPendingLease(lease)) {
            return 2;
          } else {
            return 3;
          }
        };

        const priorityA = getStatusPriority(a);
        const priorityB = getStatusPriority(b);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If same priority, sort by date (newest first)
        const dateA = a.meta?.lastEditTime;
        const dateB = b.meta?.lastEditTime;

        return moment(dateB).valueOf() - moment(dateA).valueOf();
      });
  }, [leases]);

  const body = () => {
    if (isFetching) {
      return <Loader label={t('widgets.myLeases.loading', { ns: 'home' })} />;
    }

    if (isError) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return (
        <ErrorPanel
          description={`Your leases can't be retrieved at the moment. Server error: ${errorMessage}`}
          retry={refetch}
          error={error as Error}
        />
      );
    }

    if ((filteredLeases || []).length === 0) {
      return (
        <InfoPanel
          header={t('widgets.myLeases.noLeases.title', { ns: 'home' })}
          description={t('widgets.myLeases.noLeases.description', { ns: 'home' })}
          actionLabel={t('widgets.myLeases.noLeases.action', { ns: 'home' })}
          action={() => navigate("/request")}
        />
      );
    }

    return (
      <SpaceBetween size="xl">
        {filteredLeases?.map((lease) => (
          <LeasePanel key={lease.uuid} lease={lease} />
        ))}
      </SpaceBetween>
    );
  };

  const count = () => {
    if (!isFetching && !isError) {
      return (
        <span data-counter>
          ({t('widgets.myLeases.count', { 
            ns: 'home', 
            replace: { count: (filteredLeases || []).length } 
          })})
        </span>
      );
    }
  };

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        description={t('widgets.myLeases.description', { ns: 'home' })}
        actions={
          <Button
            iconName="refresh"
            ariaLabel={t('actions.refresh', { ns: 'home' })}
            disabled={isFetching}
            onClick={() => refetch()}
          />
        }
      >
        {t('widgets.myLeases.title', { ns: 'home' })} {count()}
      </Header>
      {body()}
    </SpaceBetween>
  );
};
