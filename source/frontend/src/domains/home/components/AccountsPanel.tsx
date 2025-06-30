// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Button, Header, SpaceBetween } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";

import { AccountsSummary } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary";
import { useGetAccounts } from "@amzn/innovation-sandbox-frontend/domains/accounts/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const AccountsPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: accounts, isFetching, refetch } = useGetAccounts();

  return (
    <SpaceBetween size="m">
      <Header
        variant="h2"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button
              iconName="refresh"
              ariaLabel={t('actions.refresh', { ns: 'home' })}
              disabled={isFetching}
              onClick={() => refetch()}
            />
            <Button onClick={() => navigate("/accounts")}>
              {t('widgets.accounts.manageAccounts', { ns: 'home' })}
            </Button>
          </SpaceBetween>
        }
      >
        {t('widgets.accounts.title', { ns: 'home' })}
      </Header>
      <AccountsSummary accounts={accounts} isLoading={isFetching} />
    </SpaceBetween>
  );
};
