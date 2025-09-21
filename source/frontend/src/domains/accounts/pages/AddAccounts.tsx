// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Button, SpaceBetween, Table, Header, TextFilter, CollectionPreferences } from "@cloudscape-design/components";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BatchActionReview } from "@amzn/innovation-sandbox-frontend/components/MultiSelectTableActionReview";
import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useAddAccount,
  useGetUnregisteredAccounts,
} from "@amzn/innovation-sandbox-frontend/domains/accounts/hooks";
import { UnregisteredAccount } from "@amzn/innovation-sandbox-frontend/domains/accounts/types";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useModal } from "@amzn/innovation-sandbox-frontend/hooks/useModal";
import { useNavigate } from "react-router-dom";

export const AddAccounts = () => {
  const { t } = useTranslation(['accounts']);
  const setBreadcrumb = useBreadcrumb();
  const navigate = useNavigate();
  const {
    data: unregisteredAccounts,
    isLoading: getUnregisteredAccountsIsLoading,
    isFetching: getUnregisteredAccountsIsFetching,
    refetch,
  } = useGetUnregisteredAccounts();

  const { mutateAsync: addAccount } = useAddAccount();

  const [selectedAccounts, setSelectedAccounts] = useState<
    UnregisteredAccount[]
  >([]);
  const [filteringText, setFilteringText] = useState("");

  // Filter accounts by search text
  const filteredAccounts = useMemo(() => {
    if (!unregisteredAccounts) return [];
    if (!filteringText) return unregisteredAccounts;
    
    return unregisteredAccounts.filter(account =>
      account.Id.toLowerCase().includes(filteringText.toLowerCase()) ||
      (account.Name && account.Name.toLowerCase().includes(filteringText.toLowerCase())) ||
      (account.Email && account.Email.toLowerCase().includes(filteringText.toLowerCase()))
    );
  }, [unregisteredAccounts, filteringText]);

  const { showModal } = useModal();

  useEffect(() => {
    setBreadcrumb([
      { text: t("breadcrumbs.home", { ns: "common" }), href: "/" },
      { text: t("breadcrumbs.accounts"), href: "/accounts" },
      { text: t("addAccounts.breadcrumb"), href: "/accounts/new" },
    ]);
  }, [t, setBreadcrumb]);

  const showRegisterModal = () =>
    showModal({
      header: t("addAccounts.modal.header"),
      content: (
        <BatchActionReview
          items={selectedAccounts}
          description={t("addAccounts.modal.description", { count: selectedAccounts.length })}
          columnDefinitions={columnDefinitions}
          identifierKey="Id"
          footer={
            <Alert type="warning" header={t("addAccounts.modal.warning.header")}>
              {t("addAccounts.modal.warning.content")}
              <br />
              {t("addAccounts.modal.warning.undoable")}
            </Alert>
          }
          onSubmit={async (account: UnregisteredAccount) => {
            await addAccount(account.Id);
          }}
          onSuccess={() => {
            navigate("/accounts");
            showSuccessToast(t("addAccounts.modal.success"));
          }}
          onError={() =>
            showErrorToast(
              t("addAccounts.modal.error.message"),
              t("addAccounts.modal.error.title"),
            )
          }
        />
      ),
      size: "max",
    });

  const columnDefinitions = [
    {
      id: "Id",
      header: t("addAccounts.table.headers.accountId"),
      cell: (account: UnregisteredAccount) => account.Id,
      sortingField: "Id",
      isRowHeader: true,
    },
    {
      id: "Email",
      header: t("addAccounts.table.headers.email"),
      cell: (account: UnregisteredAccount) => account.Email,
      sortingField: "Email",
    },
    {
      id: "Name",
      header: t("addAccounts.table.headers.name"),
      cell: (account: UnregisteredAccount) => account.Name,
      sortingField: "Name",
    },
  ];

  return (
    <Table
      stripedRows
      trackBy="Id"
      columnDefinitions={columnDefinitions}
      items={filteredAccounts}
      selectedItems={selectedAccounts}
      onSelectionChange={({ detail }) =>
        setSelectedAccounts(detail.selectedItems)
      }
      selectionType="multi"
      loading={getUnregisteredAccountsIsFetching}
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
      header={
        <Header
          counter={`(${filteredAccounts?.length || 0})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                onClick={() => refetch()}
                disabled={getUnregisteredAccountsIsLoading}
              />
              <Button
                variant="primary"
                onClick={showRegisterModal}
                disabled={selectedAccounts.length === 0}
              >
                {t("addAccounts.table.actions.register")}
              </Button>
            </SpaceBetween>
          }
        >
          {t("addAccounts.table.header")}
        </Header>
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
            visibleContent: ["Id", "Email", "Name"]
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
                  { id: "Id", label: t("addAccounts.table.headers.accountId") },
                  { id: "Email", label: t("addAccounts.table.headers.email") },
                  { id: "Name", label: t("addAccounts.table.headers.name") }
                ]
              }
            ]
          }}
        />
      }
    />
  );
};
