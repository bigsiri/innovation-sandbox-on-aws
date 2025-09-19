// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import Table from "@aws-northstar/ui/components/Table";
import {
  Box,
  Button,
  ButtonDropdown,
  CollectionPreferences,
  SpaceBetween,
  StatusIndicator,
  TextContent,
} from "@cloudscape-design/components";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useDeleteLeaseTemplates,
  useGetLeaseTemplates,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

const NameCell = ({ item }: { item: LeaseTemplate }) => (
  <>
    <Box>
      <TextLink to={`/lease_templates/edit/${item.uuid}`}>{item.name}</TextLink>
    </Box>
    <Box>
      <small data-break-spaces>{item.description}</small>
    </Box>
  </>
);

const MaxSpendCell = ({ item }: { item: LeaseTemplate }) => {
  const { t } = useTranslation(['leaseTemplates']);
  return (
    <>
      {item.maxSpend ? (
        formatCurrency(item.maxSpend)
      ) : (
        <StatusIndicator type="info">{t("noMaxBudget")}</StatusIndicator>
      )}
    </>
  );
};

const ExpiryCell = ({ item }: { item: LeaseTemplate }) => {
  const { t } = useTranslation(['leaseTemplates']);
  return (
    <>
      {item.leaseDurationInHours ? (
        `${t("after")} ${moment.duration(item.leaseDurationInHours, "hours").humanize()}`
      ) : (
        <StatusIndicator type="info">{t("noExpiry")}</StatusIndicator>
      )}
    </>
  );
};

export const LeaseTemplatesTable = () => {
  const { t, i18n } = useTranslation(['leaseTemplates']);

  // Ensure moment locale is set correctly
  useEffect(() => {
    if (i18n.language === 'fr-CA') {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  }, [i18n.language]);

  // get lease templates using react query hook
  const {
    data: leaseTemplates,
    isFetching,
    isError,
    refetch,
    error: getError,
  } = useGetLeaseTemplates();

  // selected items state
  const [selectedItems, setSelectedItems] = useState<LeaseTemplate[]>([]);

  // state to show/hide delete modal dialog
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);

  // hook to delete lease templates
  const {
    mutateAsync: deleteLeaseTemplates,
    isPending: isDeleting,
    isError: isDeleteError,
    error: deleteError,
  } = useDeleteLeaseTemplates();

  // hide error message when displaying modal
  useEffect(() => {
    setShowDeleteError(false);
  }, [isDeleteModalVisible]);

  // show modal error message if error occurred during delete
  useEffect(() => {
    setShowDeleteError(isDeleteError);
  }, [isDeleteError]);

  // delete lease templates using above hook when confirming in modal dialog
  const handleDelete = async () => {
    const selectedIds = selectedItems.map((x) => x.uuid);
    await deleteLeaseTemplates(selectedIds);
    setSelectedItems([]);
    setDeleteModalVisible(false);
    showSuccessToast(t("deleteSuccess"));
  };

  if (isError) {
    return (
      <ErrorPanel
        retry={refetch}
        description="Could not load lease templates. Please try again."
        error={getError as Error}
      />
    );
  }

  return (
    <>
      <Table
        header={t("leaseTemplates")}
        stripedRows
        resizableColumns
        trackBy="uuid"
        loading={isFetching}
        items={leaseTemplates || []}
        totalItemsCount={(leaseTemplates || []).length}
        preferences={
          <CollectionPreferences
            title={t("preferences")}
            confirmLabel={t("confirm")}
            cancelLabel={t("cancel")}
            preferences={{
              pageSize: 10,
              wrapLines: false,
              stripedRows: true,
              visibleContent: ["name", "createdBy", "maxSpend", "leaseDurationInHours", "meta.lastEditTime"]
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
                    { id: "name", label: t("name") },
                    { id: "createdBy", label: t("createdBy") },
                    { id: "maxSpend", label: t("maxBudget") },
                    { id: "leaseDurationInHours", label: t("expiry") },
                    { id: "meta.lastEditTime", label: t("lastUpdated") }
                  ]
                }
              ]
            }}
          />
        }
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        columnDefinitions={[
          {
            id: "name",
            header: t("name"),
            sortingField: "name",
            cell: (item: LeaseTemplate) => <NameCell item={item} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "createdBy",
            header: t("createdBy"),
            sortingField: "createdBy",
            cell: (item: LeaseTemplate) => item.createdBy,
          },
          {
            id: "maxSpend",
            header: t("maxBudget"),
            sortingField: "maxSpend",
            cell: (item: LeaseTemplate) => <MaxSpendCell item={item} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "leaseDurationInHours",
            header: t("expiry"),
            sortingField: "leaseDurationInHours",
            cell: (item: LeaseTemplate) => <ExpiryCell item={item} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "meta.lastEditTime",
            header: t("lastUpdated"),
            sortingField: "meta.lastEditTime",
            cell: (item: LeaseTemplate) =>
              moment(item.meta?.lastEditTime).fromNow(),
          },
        ]}
        actions={
          <SpaceBetween direction="horizontal" size="s">
            <Button
              data-testid="refresh-button"
              iconName="refresh"
              onClick={() => refetch()}
              disabled={isFetching}
            />
            <ButtonDropdown
              disabled={selectedItems.length === 0}
              items={[{ text: t("delete"), id: "delete" }]}
              onItemClick={({ detail }) => {
                if (detail.id === "delete") {
                  setDeleteModalVisible(true);
                }
              }}
            >
              {t("actions")}
            </ButtonDropdown>
          </SpaceBetween>
        }
      />

      <DeleteConfirmationDialog
        variant="confirmation"
        visible={isDeleteModalVisible}
        title={t("removeLeaseTemplates")}
        onCancelClicked={() => setDeleteModalVisible(false)}
        onDeleteClicked={handleDelete}
        loading={isDeleting}
      >
        <TextContent>
          {t("confirmDelete")}
        </TextContent>

        {showDeleteError && (
          <ErrorPanel
            description={t("deleteError")}
            error={deleteError as Error}
          />
        )}
      </DeleteConfirmationDialog>
    </>
  );
};
