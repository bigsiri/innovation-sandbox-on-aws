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
      setEmailError("At least one email is required");
      return [];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return [];
    }

    if (emails.length > 20) {
      setEmailError("Maximum 20 users can be added at once");
      return [];
    }

    setEmailError(null);
    return emails;
  };

  const handleSubmit = async () => {
    let emails: string[] = [];

    if (activeTab === "search") {
      if (selectedUsers.length === 0) {
        setEmailError("Please select at least one user");
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
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!canSubmit}
          >
            Add Users
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
              label: "Search Users",
              content: (
                <SpaceBetween size="m">
                  <FormField
                    label="Search and add users"
                    description="Type to search for users by email or name"
                    errorText={activeTab === "search" ? emailError : undefined}
                  >
                    <UserSearchInput
                      onUserSelect={handleUserSelect}
                      disabled={isLoading}
                      existingUsers={selectedUsers.map(u => u.email)}
                    />
                  </FormField>

                  {selectedUsers.length > 0 && (
                    <FormField label={`Selected Users (${selectedUsers.length})`}>
                      <TokenGroup
                        items={selectedUsers.map(user => ({
                          label: user.displayName || user.email,
                          description: user.displayName ? user.email : undefined,
                          dismissLabel: `Remove ${user.email}`,
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
                  Bulk Entry
                  <Badge color="grey">Advanced</Badge>
                </SpaceBetween>
              ),
              content: (
                <FormField
                  label="User Emails"
                  description="Enter email addresses separated by commas or new lines. Maximum 20 users per request."
                  errorText={activeTab === "bulk" ? emailError : undefined}
                >
                  <Textarea
                    value={bulkEmails}
                    onChange={({ detail }) => setBulkEmails(detail.value)}
                    placeholder="user1@example.com, user2@example.com"
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
