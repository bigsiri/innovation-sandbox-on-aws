// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SpaceBetween,
  Container,
  Header,
  Button,
  Alert,
  Modal,
  Box,
} from "@cloudscape-design/components";
import { useState } from "react";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { showSuccessToast, showErrorToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import {
  useGetLeaseUsers,
  useAddUserToLease,
  useRemoveUserFromLease,
} from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { AddUserForm } from "./AddUserForm";
import { UserList } from "./UserList";

interface UsersTabProps {
  leaseId: string;
  currentUserEmail?: string;
  isLeaseActive?: boolean;
}

export const UsersTab = ({ 
  leaseId, 
  currentUserEmail,
  isLeaseActive = true 
}: UsersTabProps) => {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
  } = useGetLeaseUsers(leaseId);

  const {
    mutateAsync: addUser,
    isPending: isAddingUser,
  } = useAddUserToLease();

  const {
    mutateAsync: removeUser,
    isPending: isRemovingUser,
  } = useRemoveUserFromLease();

  const users = usersResponse?.users || [];

  const handleAddUser = async (userEmails: string[]) => {
    try {
      setAddUserError(null);
      const response = await addUser({ leaseId, userEmails });
      
      // Always close the form after attempting to add users
      setShowAddUserForm(false);
      
      if (response.successCount > 0 && response.failureCount === 0) {
        // All users added successfully
        showSuccessToast(`Successfully added ${response.successCount} user(s)`);
      } else if (response.successCount > 0 && response.failureCount > 0) {
        // Mixed results
        showSuccessToast(`Added ${response.successCount} user(s). ${response.failureCount} failed.`);
      } else if (response.failureCount > 0) {
        // All failed
        showErrorToast(`Failed to add ${response.failureCount} user(s)`);
      }
      
      // Refresh the user list to show any successfully added users
      refetchUsers();
    } catch (error) {
      setShowAddUserForm(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user';
      showErrorToast(errorMessage);
    }
  };

  const handleRemoveUser = async (userEmail: string) => {
    try {
      await removeUser({ leaseId, userEmail });
      showSuccessToast('User removed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove user';
      showErrorToast(errorMessage);
    }
  };

  if (isLoadingUsers) {
    return <Loader label="Loading users..." />;
  }

  if (isUsersError) {
    return (
      <ErrorPanel
        description="There was a problem loading the users for this lease."
        retry={refetchUsers}
        error={usersError as Error}
      />
    );
  }

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Add users to share access to this AWS account"
          actions={
            isLeaseActive && (
              <Button
                variant="primary"
                onClick={() => setShowAddUserForm(true)}
                disabled={isAddingUser || isRemovingUser}
              >
                Add User
              </Button>
            )
          }
        >
          Lease Users
        </Header>
      }
    >
      <SpaceBetween size="l">
        {!isLeaseActive && (
          <Alert type="warning">
            Cannot modify users - lease is not active
          </Alert>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" color="text-body-secondary">
            <SpaceBetween size="s">
              <div>No additional users added to this lease</div>
              <div>This lease is currently only accessible by the lease owner. Add users to share access to the AWS account.</div>
            </SpaceBetween>
          </Box>
        ) : (
          <UserList
            users={users}
            isLoading={isLoadingUsers}
            onRemoveUser={handleRemoveUser}
            isRemoving={isRemovingUser}
            currentUserEmail={currentUserEmail}
          />
        )}

        <Modal
          visible={showAddUserForm}
          onDismiss={() => setShowAddUserForm(false)}
          header="Add User to Lease"
          closeAriaLabel="Close modal"
        >
          <AddUserForm
            onSubmit={handleAddUser}
            onCancel={() => setShowAddUserForm(false)}
            isLoading={isAddingUser}
            error={addUserError}
          />
        </Modal>
      </SpaceBetween>
    </Container>
  );
};
