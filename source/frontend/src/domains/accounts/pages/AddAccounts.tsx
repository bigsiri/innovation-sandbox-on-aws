// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Button, SpaceBetween } from "@cloudscape-design/components";
import { useEffect, useState } from "react";

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
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { Table } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";

export const AddAccounts = () => {
  const { t } = useTranslation();
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
      { text: t('breadcrumbs.home', { ns: 'accounts' }), href: "/" },
      { text: t('breadcrumbs.accounts', { ns: 'accounts' }), href: "/accounts" },
      { text: t('breadcrumbs.addAccounts', { ns: 'accounts' }), href: "/accounts/new" },
    ]);
  }, [t]);

  const showRegisterModal = () =>
    showModal({
      header: t('forms.add.reviewTitle', { ns: 'accounts' }),
      content: (
        <BatchActionReview
          items={selectedAccounts}
          description={t('forms.add.reviewDescription', { 
            ns: 'accounts', 
            replace: { count: selectedAccounts.length } 
          })}
          columnDefinitions={columnDefinitions}
          identifierKey="Id"
          footer={
            <Alert type="warning" header={t('forms.add.warning.title', { ns: 'accounts' })}>
              {t('forms.add.warning.message', { ns: 'accounts' })}
              <br />
              {t('forms.add.warning.disclaimer', { ns: 'accounts' })}
            </Alert>
          }
          onSubmit={async (account: UnregisteredAccount) => {
            await addAccount(account.Id);
          }}
          onSuccess={() => {
            navigate("/accounts");
            showSuccessToast(t('forms.add.success', { ns: 'accounts' }));
          }}
          onError={() =>
            showErrorToast(
              t('forms.add.error', { ns: 'accounts' }),
              t('forms.add.errorTitle', { ns: 'accounts' }),
            )
          }
        />
      ),
      size: "max",
    });

  const columnDefinitions = [
    {
      cell: (account: UnregisteredAccount) => account.Id,
      header: t('columns.accountId', { ns: 'accounts' }),
      id: "Id",
    },
    {
      cell: (account: UnregisteredAccount) => account.Email,
      header: t('columns.email', { ns: 'accounts' }),
      id: "Email",
    },
    {
      cell: (account: UnregisteredAccount) => account.Name,
      header: t('columns.name', { ns: 'accounts' }),
      id: "Name",
    },
  ];

  return (
    <Table
      header={t('forms.add.title', { ns: 'accounts' })}
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            iconName="refresh"
            onClick={() => refetch()}
            disabled={getUnregisteredAccountsIsLoading}
          >
            {t('actions.refresh', { ns: 'accounts' })}
          </Button>
          <Button
            variant="primary"
            onClick={showRegisterModal}
            disabled={selectedAccounts.length === 0}
          >
            {t('actions.register', { ns: 'accounts' })}
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
