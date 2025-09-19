// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Form,
  FormField,
  Textarea,
  SpaceBetween,
  Alert,
  Tabs,
  Badge,
  TokenGroup,
} from "@cloudscape-design/components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserSearchInput } from "../user-search/UserSearchInput";

interface User {
  email: string;
  displayName?: string;
}

interface AddUserFormProps {
  onSubmit: (userEmails: string[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const AddUserForm = ({
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}: AddUserFormProps) => {
  const { t } = useTranslation(['leases']);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [bulkEmails, setBulkEmails] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some(u => u.email === user.email)) {
      setSelectedUsers(prev => [...prev, user]);
      setEmailError(null);
    }
  };

  const handleRemoveUser = (email: string) => {
    setSelectedUsers(prev => prev.filter(u => u.email !== email));
  };

  const validateBulkEmails = (emailsText: string): string[] => {
    const emails = emailsText
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      setEmailError(t("users.addForm.validation.atLeastOneEmail"));
      return [];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setEmailError(t("users.addForm.validation.invalidEmails", { emails: invalidEmails.join(', ') }));
      return [];
    }

    if (emails.length > 20) {
      setEmailError(t("users.addForm.validation.maxUsers"));
      return [];
    }

    setEmailError(null);
    return emails;
  };

  const handleSubmit = async () => {
    let emails: string[] = [];

    if (activeTab === "search") {
      if (selectedUsers.length === 0) {
        setEmailError(t("users.addForm.validation.selectAtLeastOne"));
        return;
      }
      emails = selectedUsers.map(u => u.email);
    } else {
      emails = validateBulkEmails(bulkEmails);
      if (emails.length === 0) return;
    }

    try {
      await onSubmit(emails);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const canSubmit = activeTab === "search" 
    ? selectedUsers.length > 0 
    : bulkEmails.trim().length > 0;

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={onCancel}>
            {t("users.addForm.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!canSubmit}
          >
            {t("users.addForm.addUsers")}
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        <Tabs
          activeTabId={activeTab}
          onChange={({ detail }) => setActiveTab(detail.activeTabId)}
          tabs={[
            {
              id: "search",
              label: t("users.addForm.tabs.searchUsers"),
              content: (
                <SpaceBetween size="m">
                  <FormField
                    label={t("users.addForm.searchLabel")}
                    description={t("users.addForm.searchDescription")}
                    errorText={activeTab === "search" ? emailError : undefined}
                  >
                    <UserSearchInput
                      onUserSelect={handleUserSelect}
                      disabled={isLoading}
                      existingUsers={selectedUsers.map(u => u.email)}
                    />
                  </FormField>

                  {selectedUsers.length > 0 && (
                    <FormField label={t("users.addForm.selectedUsers", { count: selectedUsers.length })}>
                      <TokenGroup
                        items={selectedUsers.map(user => ({
                          label: user.displayName || user.email,
                          description: user.displayName ? user.email : undefined,
                          dismissLabel: t("users.addForm.removeUser", { email: user.email }),
                        }))}
                        onDismiss={({ detail }) => {
                          const userToRemove = selectedUsers[detail.itemIndex];
                          handleRemoveUser(userToRemove.email);
                        }}
                      />
                    </FormField>
                  )}
                </SpaceBetween>
              ),
            },
            {
              id: "bulk",
              label: (
                <SpaceBetween direction="horizontal" size="xs">
                  {t("users.addForm.tabs.bulkEntry")}
                  <Badge color="grey">{t("users.addForm.advanced")}</Badge>
                </SpaceBetween>
              ),
              content: (
                <FormField
                  label={t("users.addForm.bulkLabel")}
                  description={t("users.addForm.bulkDescription")}
                  errorText={activeTab === "bulk" ? emailError : undefined}
                >
                  <Textarea
                    value={bulkEmails}
                    onChange={({ detail }) => setBulkEmails(detail.value)}
                    placeholder={t("users.addForm.bulkPlaceholder")}
                    rows={4}
                    disabled={isLoading}
                  />
                </FormField>
              ),
            },
          ]}
        />
      </SpaceBetween>
    </Form>
  );
};
