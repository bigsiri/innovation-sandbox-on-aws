// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Button, SpaceBetween } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
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
import { Table } from "@aws-northstar/ui";
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
      cell: (account: UnregisteredAccount) => account.Id,
      header: t("addAccounts.table.headers.accountId"),
      id: "Id",
    },
    {
      cell: (account: UnregisteredAccount) => account.Email,
      header: t("addAccounts.table.headers.email"),
      id: "Email",
    },
    {
      cell: (account: UnregisteredAccount) => account.Name,
      header: t("addAccounts.table.headers.name"),
      id: "Name",
    },
  ];

  return (
    <Table
      header={t("addAccounts.table.header")}
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
      trackBy="Id"
      columnDefinitions={columnDefinitions}
      items={unregisteredAccounts ?? []}
      loading={getUnregisteredAccountsIsFetching}
      selectionType="multi"
      selectedItems={selectedAccounts}
      onSelectionChange={({ detail }) =>
        setSelectedAccounts(detail.selectedItems)
      }
      stripedRows
      enableKeyboardNavigation
    />
  );
};
