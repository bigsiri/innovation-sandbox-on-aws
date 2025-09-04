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
      header: "Email",
      cell: (item: LeaseUser) => (
        <SpaceBetween direction="horizontal" size="xs">
          <span>{item.userEmail}</span>
          {item.userEmail === currentUserEmail && (
            <Box color="text-body-secondary" fontSize="body-s">
              (You)
            </Box>
          )}
        </SpaceBetween>
      ),
      sortingField: "userEmail",
      isRowHeader: true,
    },
    {
      id: "addedBy",
      header: "Added By",
      cell: (item: LeaseUser) => item.addedBy,
      sortingField: "addedBy",
    },
    {
      id: "addedDate",
      header: "Added Date",
      cell: (item: LeaseUser) => new Date(item.addedDate).toLocaleDateString(),
      sortingField: "addedDate",
    },
    {
      id: "status",
      header: "Status",
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
          ariaLabel={`Remove ${item.userEmail} from lease`}
        >
          Remove
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
        header="Remove User"
        closeAriaLabel="Close modal"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRemove}
                loading={isRemoving}
              >
                Remove User
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="span">
            Are you sure you want to remove <strong>{selectedUser?.userEmail}</strong> from this lease?
          </Box>
          <Box variant="span" color="text-body-secondary">
            This action cannot be undone. The user will lose access to the AWS account.
          </Box>
        </SpaceBetween>
      </Modal>
    </>
  );
};
