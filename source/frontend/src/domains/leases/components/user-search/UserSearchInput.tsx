// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Autosuggest,
  SpaceBetween,
  Box,
} from "@cloudscape-design/components";
import { useUserSearch } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";

interface User {
  email: string;
  displayName?: string;
}

interface UserSearchInputProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  disabled?: boolean;
  existingUsers?: string[]; // Emails of users already added
}

export const UserSearchInput = ({
  onUserSelect,
  placeholder = "Search for users by email...",
  disabled = false,
  existingUsers = [],
}: UserSearchInputProps) => {
  const {
    value,
    setValue,
    options,
    status,
    handleLoadItems,
    handleSelect,
  } = useUserSearch(existingUsers);

  const onSelect = ({ detail }: { detail: { value: string } }) => {
    const user = handleSelect(detail.value);
    onUserSelect(user);
  };

  return (
    <SpaceBetween size="xs">
      <Autosuggest
        onChange={({ detail }) => setValue(detail.value)}
        onLoadItems={handleLoadItems}
        onSelect={onSelect}
        value={value}
        options={options}
        statusType={status}
        placeholder={placeholder}
        disabled={disabled}
        empty={
          value.length >= 2 ? (
            <Box textAlign="center" color="text-body-secondary">
              No users found
            </Box>
          ) : (
            <Box textAlign="center" color="text-body-secondary">
              Type at least 2 characters to search
            </Box>
          )
        }
        loadingText="Searching users..."
        errorText="Error loading users"
        recoveryText="Retry"
        enteredTextLabel={(value) => `Use "${value}"`}
      />
    </SpaceBetween>
  );
};
