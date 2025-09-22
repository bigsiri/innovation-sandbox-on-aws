// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  ButtonDropdown,
  CollectionPreferences,
  Container,
  ContentLayout,
  Header,
  Popover,
  SpaceBetween,
  Table,
  TextFilter,
} from "@cloudscape-design/components";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

const StatusCell = ({ account }: { account: SandboxAccount }) => (
  <AccountStatusIndicator
    status={account.status}
    lastCleanupStartTime={
      account.cleanupExecutionContext?.stateMachineExecutionStartTime || ""
    }
  />
);

const CreatedOnCell = ({ account, language }: { account: SandboxAccount; language: string }) => {
  const locale = language === 'fr-CA' ? 'fr' : 'en';
  return (
    <Popover
      position="top"
      dismissButton={false}
      content={moment(account.meta?.createdTime).locale(locale).format("MM/DD/YYYY hh:mm:A")}
    >
      {moment(account.meta?.createdTime).locale(locale).fromNow()}
    </Popover>
  );
};

const LastModifiedCell = ({ account, language }: { account: SandboxAccount; language: string }) => {
  const locale = language === 'fr-CA' ? 'fr' : 'en';
  return (
    <Popover
      position="top"
      dismissButton={false}
      content={moment(account.meta?.lastEditTime).locale(locale).format("MM/DD/YYYY hh:mm:A")}
    >
      {moment(account.meta?.lastEditTime).locale(locale).fromNow()}
    </Popover>
  );
};

const AccessCell = ({ account }: { account: SandboxAccount }) => (
  <AccountLoginLink accountId={account.awsAccountId} />
);

const createColumnDefinitions = (includeLinks: boolean, t: any, language: string) =>
  [
    {
      id: "awsAccountId",
      header: t("table.headers.accountId"),
      sortingField: "awsAccountId",
      cell: (account: SandboxAccount) => account.awsAccountId,
    },
    {
      id: "status",
      header: t("table.headers.status"),
      sortingComparator: accountStatusSortingComparator,
      cell: (account: SandboxAccount) => <StatusCell account={account} />,
    },
    {
      id: "createdOn",
      header: t("table.headers.added"),
      sortingField: "createdOn",
      cell: (account: SandboxAccount) => <CreatedOnCell account={account} language={language} />,
    },
    {
      id: "lastModifiedOn",
      header: t("table.headers.lastModified"),
      sortingField: "lastModifiedOn",
      cell: (account: SandboxAccount) => <LastModifiedCell account={account} language={language} />,
    },
    {
      id: "name",
      header: t("table.headers.name"),
      cell: (account: SandboxAccount) => account.name ?? t("notAvailable"),
    },
    {
      id: "email",
      header: t("table.headers.email"),
      cell: (account: SandboxAccount) => account.email ?? t("notAvailable"),
    },
    {
      id: "link",
      header: t("table.headers.access"),
      cell: (account: SandboxAccount) => <AccessCell account={account} />,
    },
  ].filter((column) => includeLinks || column.id !== "link");

type EjectModalProps = {
  selectedAccounts: SandboxAccount[];
  ejectAccount: (accountId: string) => Promise<any>;
  navigate: (path: string) => void;
  t: any;
  language: string;
};

const EjectModalContent = ({
  selectedAccounts,
  ejectAccount,
  navigate,
  t,
  language,
}: EjectModalProps) => (
  <BatchActionReview
    items={selectedAccounts}
    description={t("ejectDescription", { count: selectedAccounts.length })}
    columnDefinitions={createColumnDefinitions(false, t, language)}
    identifierKey="awsAccountId"
    onSubmit={async (account: SandboxAccount) => {
      await ejectAccount(account.awsAccountId);
    }}
    onSuccess={() => {
      navigate("/accounts");
      showSuccessToast(
        t("ejectSuccessMessage"),
      );
    }}
    onError={() =>
      showErrorToast(
        t("ejectErrorMessage"),
        t("ejectErrorTitle"),
      )
    }
  />
);

type CleanupModalProps = {
  selectedAccounts: SandboxAccount[];
  cleanupAccount: (accountId: string) => Promise<any>;
  navigate: (path: string) => void;
  t: any;
  language: string;
};

const CleanupModalContent = ({
  selectedAccounts,
  cleanupAccount,
  navigate,
  t,
  language,
}: CleanupModalProps) => (
  <BatchActionReview
    items={selectedAccounts}
    description={t("cleanupDescription", { count: selectedAccounts.length })}
    columnDefinitions={createColumnDefinitions(false, t, language)}
    identifierKey="awsAccountId"
    onSubmit={async (account: SandboxAccount) => {
      await cleanupAccount(account.awsAccountId);
    }}
    onSuccess={() => {
      navigate("/accounts");
      showSuccessToast(t("cleanupSuccessMessage"));
    }}
    onError={() =>
      showErrorToast(
        t("cleanupErrorMessage"),
        t("cleanupErrorTitle"),
      )
    }
  />
);

export const ListAccounts = () => {
  // base ui hooks
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['accounts']);
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();

  // Set moment locale based on current language
  useEffect(() => {
    if (i18n.language === 'fr-CA') {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  }, [i18n.language]);

  // modal hook
  const { showModal } = useModal();

  // api hooks
  const { data: accounts, isFetching, refetch } = useGetAccounts();
  const { mutateAsync: ejectAccount } = useEjectAccount();
  const { mutateAsync: cleanupAccount } = useCleanupAccount();

  // state
  const [filter, setFilter] = useState<SandboxAccountStatus>();
  const [selectedAccounts, setSelectedAccounts] = useState<SandboxAccount[]>(
    [],
  );
  const [filteredAccounts, setFilteredAccounts] = useState<SandboxAccount[]>(
    [],
  );
  const [filteringText, setFilteringText] = useState("");

  // Filter accounts by search text
  const searchFilteredAccounts = useMemo(() => {
    if (!filteredAccounts) return [];
    if (!filteringText) return filteredAccounts;
    
    return filteredAccounts.filter(account =>
      account.awsAccountId.toLowerCase().includes(filteringText.toLowerCase()) ||
      (account.name && account.name.toLowerCase().includes(filteringText.toLowerCase())) ||
      (account.email && account.email.toLowerCase().includes(filteringText.toLowerCase()))
    );
  }, [filteredAccounts, filteringText]);

  useInit(async () => {
    setBreadcrumb([
      { text: t("breadcrumbs.home", { ns: "common" }), href: "/" },
      { text: t("breadcrumbs.accounts"), href: "/accounts" },
    ]);
    setTools(<Markdown file="accounts" />);
  });

  const onCreateClick = () => {
    navigate("/accounts/new");
  };

  useEffect(() => {
    if (!accounts) return;

    const filtered = filter
      ? accounts.filter((x) => filter === x.status)
      : accounts;
    setFilteredAccounts(filtered);
  }, [accounts, filter]);

  const showEjectModal = () => {
    showModal({
      header: t("ejectAccounts"),
      content: (
        <EjectModalContent
          selectedAccounts={selectedAccounts}
          ejectAccount={ejectAccount}
          navigate={navigate}
          t={t}
          language={i18n.language}
        />
      ),
      size: "max",
    });
  };

  const showCleanupModal = () => {
    showModal({
      header: t("cleanupAccounts"),
      content: (
        <CleanupModalContent
          selectedAccounts={selectedAccounts}
          cleanupAccount={cleanupAccount}
          navigate={navigate}
          t={t}
          language={i18n.language}
        />
      ),
      size: "max",
    });
  };

  const handleSelectionChange = ({ detail }: any) => {
    const accounts = detail.selectedItems as SandboxAccount[];
    setSelectedAccounts(accounts);
  };

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button onClick={onCreateClick} variant="primary">
              {t("addAccounts.breadcrumb")}
            </Button>
          }
          description={t("pageDescription")}
        >
          {t("accounts")}
        </Header>
      }
    >
      <SpaceBetween size="m">
        <AccountsSummary
          isLoading={isFetching}
          accounts={accounts}
          filter={filter}
          onFilterUpdated={setFilter}
        />
        <Container>
          <Table
            data-embedded-table
            variant="embedded"
            stripedRows
            trackBy="awsAccountId"
            columnDefinitions={createColumnDefinitions(true, t, i18n.language)}
            items={searchFilteredAccounts}
            selectedItems={selectedAccounts}
            onSelectionChange={handleSelectionChange}
            selectionType="multi"
            loading={isFetching}
            loadingText={t("loading")}
            empty={t("table.noItemsToDisplay")}
            filter={
              <TextFilter
                filteringPlaceholder={t("searchPlaceholder")}
                filteringText={filteringText}
                onChange={({ detail }) => setFilteringText(detail.filteringText)}
                filteringAriaLabel={t("filteringAriaLabel")}
              />
            }
            preferences={
              <CollectionPreferences
                title={t("preferences")}
                confirmLabel={t("confirm")}
                cancelLabel={t("cancel")}
                preferences={{
                  pageSize: 10,
                  wrapLines: false,
                  stripedRows: true,
                  visibleContent: ["awsAccountId", "status", "createdOn", "lastModifiedOn", "name", "email", "link"]
                }}
                pageSizePreference={{
                  title: t("selectPageSize"),
                  options: [
                    { value: 10, label: "10" },
                    { value: 20, label: "20" },
                    { value: 50, label: "50" }
                  ]
                }}
                wrapLinesPreference={{
                  label: t("wrapLines"),
                  description: t("wrapLinesDescription")
                }}
                stripedRowsPreference={{
                  label: t("stripedRows"),
                  description: t("stripedRowsDescription")
                }}
                visibleContentPreference={{
                  title: t("selectVisibleColumns"),
                  options: [
                    { 
                      label: t("mainProperties"),
                      options: [
                        { id: "awsAccountId", label: t("table.headers.accountId") },
                        { id: "status", label: t("table.headers.status") },
                        { id: "createdOn", label: t("table.headers.added") },
                        { id: "lastModifiedOn", label: t("table.headers.lastModified") },
                        { id: "name", label: t("table.headers.name") },
                        { id: "email", label: t("table.headers.email") },
                        { id: "link", label: t("table.headers.access") }
                      ]
                    }
                  ]
                }}
              />
            }
            header={
              <Header
                counter={`(${searchFilteredAccounts?.length || 0})`}
                actions={
                  <SpaceBetween direction="horizontal" size="s">
                    <Button
                      iconName="refresh"
                      data-testid="refresh-button"
                      onClick={() => refetch()}
                      disabled={isFetching}
                    />
                    <ButtonDropdown
                      disabled={selectedAccounts.length === 0}
                      items={[
                        { text: t("ejectAccount"), id: "eject" },
                        {
                          text: t("retryCleanup"),
                          id: "retryCleanup",
                          disabled:
                            // disable cleanup option unless all selected accounts are in quarantine or cleanup
                            !selectedAccounts.every(
                              (x) =>
                                x.status === "Quarantine" || x.status === "CleanUp",
                            ),
                        },
                      ]}
                      onItemClick={({ detail }) => {
                        switch (detail.id) {
                          case "eject":
                            showEjectModal();
                            break;
                          case "retryCleanup":
                            showCleanupModal();
                            break;
                        }
                      }}
                    >
                      {t("actions")}
                    </ButtonDropdown>
                  </SpaceBetween>
                }
              >
                {t("accounts")}
              </Header>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
};
