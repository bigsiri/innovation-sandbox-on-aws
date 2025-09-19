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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        showSuccessToast(t("users.successfullyAdded", { ns: "leases", count: response.successCount }));
      } else if (response.successCount > 0 && response.failureCount > 0) {
        // Mixed results
        showSuccessToast(t("users.mixedResults", { ns: "leases", successCount: response.successCount, failureCount: response.failureCount }));
      } else if (response.failureCount > 0) {
        // All failed
        showErrorToast(t("users.failedToAdd", { ns: "leases", count: response.failureCount }));
      }
      
      // Refresh the user list to show any successfully added users
      refetchUsers();
    } catch (error) {
      setShowAddUserForm(false);
      const errorMessage = error instanceof Error ? error.message : t("users.failedToAddUser", { ns: "leases" });
      showErrorToast(errorMessage);
    }
  };

  const handleRemoveUser = async (userEmail: string) => {
    try {
      await removeUser({ leaseId, userEmail });
      showSuccessToast(t("users.userRemovedSuccessfully", { ns: "leases" }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("users.failedToRemoveUser", { ns: "leases" });
      showErrorToast(errorMessage);
    }
  };

  if (isLoadingUsers) {
    return <Loader label={t("users.loadingUsers", { ns: "leases" })} />;
  }

  if (isUsersError) {
    return (
      <ErrorPanel
        description={t("users.loadingUsersError", { ns: "leases" })}
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
          description={t("users.addUsersDescription", { ns: "leases" })}
          actions={
            isLeaseActive && (
              <Button
                variant="primary"
                onClick={() => setShowAddUserForm(true)}
                disabled={isAddingUser || isRemovingUser}
              >
                {t("users.addUser", { ns: "leases" })}
              </Button>
            )
          }
        >
          {t("users.leaseUsers", { ns: "leases" })}
        </Header>
      }
    >
      <SpaceBetween size="l">
        {!isLeaseActive && (
          <Alert type="warning">
            {t("users.cannotModifyUsers", { ns: "leases" })}
          </Alert>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" color="text-body-secondary">
            <SpaceBetween size="s">
              <div>{t("users.noAdditionalUsers", { ns: "leases" })}</div>
              <div>{t("users.onlyOwnerAccess", { ns: "leases" })}</div>
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
          header={t("users.addUserToLease", { ns: "leases" })}
          closeAriaLabel={t("users.closeModal", { ns: "leases" })}
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
