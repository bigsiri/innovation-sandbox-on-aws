// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Button,
  Form,
  FormField,
  Textarea,
  SpaceBetween,
  Alert,
} from "@cloudscape-design/components";
import { useState } from "react";

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
  const [userEmails, setUserEmails] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmails = (emailsText: string): string[] => {
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
    const emails = validateEmails(userEmails);
    if (emails.length === 0) {
      return;
    }

    try {
      await onSubmit(emails);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

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
            disabled={!userEmails.trim()}
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

        <FormField
          label="User Emails"
          description="Enter email addresses separated by commas or new lines. Maximum 20 users per request."
          errorText={emailError}
        >
          <Textarea
            value={userEmails}
            onChange={({ detail }) => setUserEmails(detail.value)}
            placeholder="user1@example.com, user2@example.com"
            rows={4}
            disabled={isLoading}
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
};
