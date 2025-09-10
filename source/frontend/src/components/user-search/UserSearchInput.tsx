// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Autosuggest,
  AutosuggestProps,
  SpaceBetween,
  Box,
} from "@cloudscape-design/components";
import { useState, useCallback } from "react";
import { LeaseService } from "@amzn/innovation-sandbox-frontend/domains/leases/service";

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
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<AutosuggestProps.Option[]>([]);
  const [status, setStatus] = useState<AutosuggestProps.StatusType>("finished");

  const leaseService = new LeaseService();

  // Real user search using the API
  const searchUsers = useCallback(async (searchText: string): Promise<User[]> => {
    if (searchText.length < 2) return [];

    try {
      const response = await leaseService.searchUsers(searchText, 10);
      return response.users.map(user => ({
        email: user.email,
        displayName: user.displayName,
      }));
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }, []);

  const handleLoadItems = useCallback(async ({ detail }: { detail: AutosuggestProps.LoadItemsDetail }) => {
    const { filteringText } = detail;
    if (filteringText.length < 2) {
      setOptions([]);
      setStatus("finished");
      return;
    }

    setStatus("loading");
      
      try {
        const users = await searchUsers(filteringText);
        const newOptions: AutosuggestProps.Option[] = users.map(user => ({
          value: user.email,
          label: user.displayName ? `${user.displayName} (${user.email})` : user.email,
          description: user.displayName ? user.email : undefined,
        }));
        
        // Add option to use the typed text as email if it's a valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(filteringText) && !users.some(u => u.email === filteringText) && !existingUsers.includes(filteringText)) {
          newOptions.unshift({
            value: filteringText,
            label: filteringText,
            description: "Add this email address",
          });
        }
        
        setOptions(newOptions);
        setStatus("finished");
      } catch (error) {
        console.error("Error searching users:", error);
        setOptions([]);
        setStatus("error");
      }
  }, [searchUsers, existingUsers]);

  const handleSelect = ({ detail }: { detail: AutosuggestProps.SelectDetail }) => {
    const selectedEmail = detail.value;
    const selectedOption = options.find(opt => opt.value === selectedEmail);
    
    if (selectedEmail) {
      onUserSelect({
        email: selectedEmail,
        displayName: selectedOption?.label !== selectedEmail ? 
          selectedOption?.label?.split(' (')[0] : undefined
      });
      setValue(""); // Clear input after selection
      setOptions([]); // Clear options
    }
  };

  return (
    <SpaceBetween size="xs">
      <Autosuggest
        onChange={({ detail }) => setValue(detail.value)}
        onLoadItems={handleLoadItems}
        onSelect={handleSelect}
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
