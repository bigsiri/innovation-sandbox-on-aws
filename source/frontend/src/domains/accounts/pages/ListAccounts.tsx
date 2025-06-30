// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Table } from "@aws-northstar/ui";
import {
  Button,
  ButtonDropdown,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  SandboxAccount,
  SandboxAccountStatus,
} from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { AccountLoginLink } from "@amzn/innovation-sandbox-frontend/components/AccountLoginLink";
import { AccountsSummary } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { AccountStatusIndicator } from "@amzn/innovation-sandbox-frontend/domains/accounts/components/AccountStatusIndicator";
import { accountStatusSortingComparator } from "@amzn/innovation-sandbox-frontend/domains/accounts/helpers";
import {
  useCleanupAccount,
  useEjectAccount,
  useGetAccounts,
} from "@amzn/innovation-sandbox-frontend/domains/accounts/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatDistanceToNowLocalized } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const StatusCell = ({ account }: { account: SandboxAccount }) => (
  <AccountStatusIndicator
    status={account.status}
    lastCleanupStartTime={
      account.cleanupExecutionContext?.stateMachineExecutionStartTime!
    }
  />
);

const AddedCell = ({ account, currentLanguage }: { account: SandboxAccount; currentLanguage: string }) => (
  <>{formatDistanceToNowLocalized(new Date(account.meta?.createdTime || ''), currentLanguage as any)}</>
);

const LastModifiedCell = ({ account, currentLanguage }: { account: SandboxAccount; currentLanguage: string }) => (
  <>{formatDistanceToNowLocalized(new Date(account.meta?.lastEditTime || ''), currentLanguage as any)}</>
);

const NameCell = ({ account }: { account: SandboxAccount }) => (
  <>{account.name || '-'}</>
);

const EmailCell = ({ account }: { account: SandboxAccount }) => (
  <>{account.email || '-'}</>
);

const AccessCell = ({ account }: { account: SandboxAccount }) => {
  if (account.status === "Available") {
    return (
      <AccountLoginLink
        accountId={account.awsAccountId}
        variant="inline-link"
      />
    );
  }

  return <span>-</span>;
};

const createColumnDefinitions = (includeLinks: boolean, t: any, currentLanguage: string) => [
  {
    id: "awsAccountId",
    header: t('table.columns.accountId', { ns: 'accounts' }),
    sortingField: "awsAccountId",
    cell: (account: SandboxAccount) => account.awsAccountId,
  },
  {
    id: "status",
    header: t('table.columns.status', { ns: 'accounts' }),
    sortingComparator: accountStatusSortingComparator,
    cell: (account: SandboxAccount) => <StatusCell account={account} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "added",
    header: t('table.columns.added', { ns: 'accounts' }),
    sortingField: "meta.createdTime",
    cell: (account: SandboxAccount) => <AddedCell account={account} currentLanguage={currentLanguage} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "lastModified",
    header: t('table.columns.lastModified', { ns: 'accounts' }),
    sortingField: "meta.lastEditTime",
    cell: (account: SandboxAccount) => <LastModifiedCell account={account} currentLanguage={currentLanguage} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "name",
    header: t('table.columns.name', { ns: 'accounts' }),
    sortingField: "name",
    cell: (account: SandboxAccount) => <NameCell account={account} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "email",
    header: t('table.columns.email', { ns: 'accounts' }),
    sortingField: "email",
    cell: (account: SandboxAccount) => <EmailCell account={account} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
  {
    id: "access",
    header: t('table.columns.access', { ns: 'accounts' }),
    cell: (account: SandboxAccount) => <AccessCell account={account} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
  },
].filter((column) => includeLinks || column.id !== "access");

const ActionModalContent = ({
  selectedAccounts,
  action,
  onAction,
  t,
  currentLanguage,
}: {
  selectedAccounts: SandboxAccount[];
  action: "eject" | "cleanup";
  onAction: (accountId: string) => Promise<any>;
  t: any;
  currentLanguage: string;
}) => {
  return (
    <BatchActionReview
      items={selectedAccounts}
      description={t('actions.description', { 
        ns: 'accounts', 
        replace: { count: selectedAccounts.length, action: t(`actions.${action}`, { ns: 'accounts' }) } 
      })}
      columnDefinitions={createColumnDefinitions(false, t, currentLanguage)}
      identifierKey="awsAccountId"
      onSubmit={async (account: SandboxAccount) => {
        await onAction(account.awsAccountId);
      }}
      onSuccess={() => {
        showSuccessToast(
          t(`actions.success.${action}`, { ns: 'accounts' }),
        );
      }}
      onError={() =>
        showErrorToast(
          t(`actions.error.${action}.message`, { ns: 'accounts' }),
          t(`actions.error.${action}.title`, { ns: 'accounts' }),
        )
      }
    />
  );
};

export const ListAccounts = () => {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();

  // base ui hooks
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();

  // modal hook
  const { showModal } = useModal();

  // state
  const [selectedAccounts, setSelectedAccounts] = useState<SandboxAccount[]>(
    [],
  );

  // api hooks
  const { data: accounts, isFetching, refetch } = useGetAccounts();
  const { mutateAsync: ejectAccount } = useEjectAccount();
  const { mutateAsync: cleanupAccount } = useCleanupAccount();

  const init = async () => {
    setBreadcrumb([
      { text: t('breadcrumbs.home', { ns: 'navigation' }), href: "/" },
      { text: t('breadcrumbs.accounts', { ns: 'navigation' }), href: "/accounts" },
    ]);
    setTools(<Markdown file="accounts" />);
  };

  useInit(() => {
    init();
  });

  const showActionModal = (action: "eject" | "cleanup") => {
    showModal({
      header: t(`modal.${action}.title`, { ns: 'accounts' }),
      content: (
        <ActionModalContent
          selectedAccounts={selectedAccounts}
          action={action}
          onAction={action === "eject" ? ejectAccount : cleanupAccount}
          t={t}
          currentLanguage={currentLanguage}
        />
      ),
      size: "max",
    });
  };

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    const accounts = detail.selectedItems as SandboxAccount[];
    setSelectedAccounts(accounts);
  };

  const canEject = (status: SandboxAccountStatus) =>
    ["Available", "Frozen"].includes(status);

  const canCleanup = (status: SandboxAccountStatus) =>
    ["Quarantine"].includes(status);

  const canEjectSelected = selectedAccounts.some((account) =>
    canEject(account.status),
  );

  const canCleanupSelected = selectedAccounts.some((account) =>
    canCleanup(account.status),
  );

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={t('page.description', { ns: 'accounts' })}
          actions={
            <Button
              onClick={() => navigate("/accounts/add")}
              variant="primary"
            >
              {t('page.addAccounts', { ns: 'accounts' })}
            </Button>
          }
        >
          {t('page.title', { ns: 'accounts' })}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container>
          <AccountsSummary accounts={accounts || []} />
        </Container>
        <Table
          stripedRows
          trackBy="awsAccountId"
          columnDefinitions={createColumnDefinitions(true, t, currentLanguage)}
          header={t('table.title', { ns: 'accounts' })}
          totalItemsCount={(accounts || []).length}
          items={accounts || []}
          selectedItems={selectedAccounts}
          onSelectionChange={handleSelectionChange}
          loading={isFetching}
          loadingText={t('actions.loading', { ns: 'common' })}
          empty={t('actions.noItemsFound', { ns: 'common' })}
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Button
                iconName="refresh"
                onClick={() => refetch()}
                disabled={isFetching}
              />
              <ButtonDropdown
                disabled={selectedAccounts.length === 0}
                items={[
                  {
                    text: t('actions.eject', { ns: 'accounts' }),
                    id: "eject",
                    disabled: !canEjectSelected,
                  },
                  {
                    text: t('actions.cleanup', { ns: 'accounts' }),
                    id: "cleanup",
                    disabled: !canCleanupSelected,
                  },
                ]}
                onItemClick={({ detail }) => {
                  showActionModal(detail.id as "eject" | "cleanup");
                }}
              >
                {t('actions.title', { ns: 'accounts' })}
              </ButtonDropdown>
            </SpaceBetween>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
};
