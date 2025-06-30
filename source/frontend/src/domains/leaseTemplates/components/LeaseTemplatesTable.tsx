// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import Table from "@aws-northstar/ui/components/Table";
import {
  Box,
  Button,
  ButtonDropdown,
  SpaceBetween,
  StatusIndicator,
  TextContent,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { TextLink } from "@amzn/innovation-sandbox-frontend/components/TextLink";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useDeleteLeaseTemplates,
  useGetLeaseTemplates,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";
import { formatDistanceToNowLocalized } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";

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

const formatDurationLocalized = (durationInHours: number, currentLanguage: string): string => {
  const days = Math.floor(durationInHours / 24);
  const hours = durationInHours % 24;

  if (currentLanguage === 'fr-CA') {
    if (days > 0) {
      if (days === 1) {
        return hours > 0 ? `dans 1 jour ${hours} heure${hours > 1 ? 's' : ''}` : `dans 1 jour`;
      } else {
        return hours > 0 ? `dans ${days} jours ${hours} heure${hours > 1 ? 's' : ''}` : `dans ${days} jours`;
      }
    } else {
      return hours === 1 ? `dans 1 heure` : `dans ${hours} heures`;
    }
  } else {
    // English formatting
    if (days > 0) {
      if (days === 1) {
        return hours > 0 ? `in 1 day ${hours} hour${hours > 1 ? 's' : ''}` : `in 1 day`;
      } else {
        return hours > 0 ? `in ${days} days ${hours} hour${hours > 1 ? 's' : ''}` : `in ${days} days`;
      }
    } else {
      return hours === 1 ? `in 1 hour` : `in ${hours} hours`;
    }
  }
};

const MaxSpendCell = ({ item, t }: { item: LeaseTemplate; t: any }) => (
  <>
    {item.maxSpend ? (
      formatCurrency(item.maxSpend)
    ) : (
      <StatusIndicator type="info">{t('table.noMaxBudget', { ns: 'leaseTemplates' })}</StatusIndicator>
    )}
  </>
);

const ExpiryCell = ({ item, t, currentLanguage }: { item: LeaseTemplate; t: any; currentLanguage: string }) => (
  <>
    {item.leaseDurationInHours ? (
      t('table.expiresAfter', { 
        ns: 'leaseTemplates',
        duration: formatDurationLocalized(item.leaseDurationInHours, currentLanguage)
      })
    ) : (
      <StatusIndicator type="info">{t('table.noExpiry', { ns: 'leaseTemplates' })}</StatusIndicator>
    )}
  </>
);

export const LeaseTemplatesTable = () => {
  const { t, currentLanguage } = useTranslation();
  
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
    showSuccessToast(t('table.deleteSuccess', { ns: 'leaseTemplates' }));
  };

  if (isError) {
    return (
      <ErrorPanel
        retry={refetch}
        description={t('table.loadError', { ns: 'leaseTemplates' })}
        error={getError as Error}
      />
    );
  }

  return (
    <>
      <Table
        header={t('table.title', { ns: 'leaseTemplates' })}
        stripedRows
        resizableColumns
        trackBy="uuid"
        loading={isFetching}
        loadingText={t('actions.loading', { ns: 'common' })}
        items={leaseTemplates || []}
        totalItemsCount={(leaseTemplates || []).length}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        empty={t('actions.noItemsFound', { ns: 'common' })}
        columnDefinitions={[
          {
            id: "name",
            header: t('table.columns.name', { ns: 'leaseTemplates' }),
            sortingField: "name",
            cell: (item: LeaseTemplate) => <NameCell item={item} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "createdBy",
            header: t('table.columns.createdBy', { ns: 'leaseTemplates' }),
            sortingField: "createdBy",
            cell: (item: LeaseTemplate) => item.createdBy,
          },
          {
            id: "maxSpend",
            header: t('table.columns.maxBudget', { ns: 'leaseTemplates' }),
            sortingField: "maxSpend",
            cell: (item: LeaseTemplate) => <MaxSpendCell item={item} t={t} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "leaseDurationInHours",
            header: t('table.columns.expiry', { ns: 'leaseTemplates' }),
            sortingField: "leaseDurationInHours",
            cell: (item: LeaseTemplate) => <ExpiryCell item={item} t={t} currentLanguage={currentLanguage} />, // NOSONAR typescript:S6478 - the way the table component works requires defining component during render
          },
          {
            id: "meta.lastEditTime",
            header: t('table.columns.lastUpdated', { ns: 'leaseTemplates' }),
            sortingField: "meta.lastEditTime",
            cell: (item: LeaseTemplate) =>
              formatDistanceToNowLocalized(new Date(item.meta?.lastEditTime || ''), currentLanguage),
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
              items={[{ text: t('actions.delete', { ns: 'leaseTemplates' }), id: "delete" }]}
              onItemClick={({ detail }) => {
                if (detail.id === "delete") {
                  setDeleteModalVisible(true);
                }
              }}
            >
              {t('actions.title', { ns: 'common' })}
            </ButtonDropdown>
          </SpaceBetween>
        }
      />

      <DeleteConfirmationDialog
        variant="confirmation"
        visible={isDeleteModalVisible}
        title={t('confirmations.deleteTitle', { ns: 'leaseTemplates' })}
        onCancelClicked={() => setDeleteModalVisible(false)}
        onDeleteClicked={handleDelete}
        loading={isDeleting}
      >
        <TextContent>
          {t('confirmations.deleteMessage', { ns: 'leaseTemplates' })}
        </TextContent>

        {showDeleteError && (
          <ErrorPanel
            description={t('confirmations.deleteError', { ns: 'leaseTemplates' })}
            error={deleteError as Error}
          />
        )}
      </DeleteConfirmationDialog>
    </>
  );
};
