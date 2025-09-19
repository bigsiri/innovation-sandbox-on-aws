// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Table,
  Box,
  SpaceBetween,
  Button,
  Header,
  Modal,
} from "@cloudscape-design/components";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LeaseUser } from "@amzn/innovation-sandbox-frontend/domains/leases/service";
import { UserStatusBadge } from "./UserStatusBadge";

interface UserListProps {
  users: LeaseUser[];
  isLoading?: boolean;
  onRemoveUser: (userEmail: string) => Promise<void>;
  isRemoving?: boolean;
  currentUserEmail?: string;
}

export const UserList = ({
  users,
  isLoading = false,
  onRemoveUser,
  isRemoving = false,
  currentUserEmail,
}: UserListProps) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<LeaseUser | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveClick = (user: LeaseUser) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedUser) {
      try {
        await onRemoveUser(selectedUser.userEmail);
        setShowRemoveModal(false);
        setSelectedUser(null);
      } catch (error) {
        // Error handling is done in parent component
      }
    }
  };

  const columnDefinitions = [
    {
      id: "userEmail",
      header: t("users.email", { ns: "leases" }),
      cell: (item: LeaseUser) => (
        <SpaceBetween direction="horizontal" size="xs">
          <span>{item.userEmail}</span>
          {item.userEmail === currentUserEmail && (
            <Box color="text-body-secondary" fontSize="body-s">
              ({t("users.you", { ns: "leases" })})
            </Box>
          )}
        </SpaceBetween>
      ),
      sortingField: "userEmail",
      isRowHeader: true,
    },
    {
      id: "addedBy",
      header: t("users.addedBy", { ns: "leases" }),
      cell: (item: LeaseUser) => item.addedBy,
      sortingField: "addedBy",
    },
    {
      id: "addedDate",
      header: t("users.addedDate", { ns: "leases" }),
      cell: (item: LeaseUser) => new Date(item.addedDate).toLocaleDateString(),
      sortingField: "addedDate",
    },
    {
      id: "status",
      header: t("users.status", { ns: "leases" }),
      cell: (item: LeaseUser) => (
        <UserStatusBadge 
          status={item.assignmentStatus?.status}
          message={item.assignmentStatus?.message}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (item: LeaseUser) => (
        <Button
          variant="normal"
          iconName="remove"
          onClick={() => handleRemoveClick(item)}
          loading={isRemoving}
          disabled={item.userEmail === currentUserEmail}
          ariaLabel={t("users.removeUserFromLease", { ns: "leases", email: item.userEmail })}
        >
          {t("users.remove", { ns: "leases" })}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        columnDefinitions={columnDefinitions}
        items={users}
        loading={isLoading}
        loadingText="Loading users..."
        trackBy="userEmail"
        empty={
          <Box textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No users</b>
              <Box variant="p" color="inherit">
                No additional users have been added to this lease.
              </Box>
            </SpaceBetween>
          </Box>
        }
        header={
          <Header
            counter={`(${users.length})`}
          >
            Users
          </Header>
        }
      />

      <Modal
        visible={showRemoveModal}
        onDismiss={() => setShowRemoveModal(false)}
        header={t("users.removeUser", { ns: "leases" })}
        closeAriaLabel={t("users.closeModal", { ns: "leases" })}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowRemoveModal(false)}>
                {t("common.cancel", { ns: "leases" })}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRemove}
                loading={isRemoving}
              >
                {t("users.removeUser", { ns: "leases" })}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="span">
            {t("users.confirmRemoveUser", { ns: "leases", email: selectedUser?.userEmail })}
          </Box>
          <Box variant="span" color="text-body-secondary">
            {t("users.removeUserWarning", { ns: "leases" })}
          </Box>
        </SpaceBetween>
      </Modal>
    </>
  );
};
