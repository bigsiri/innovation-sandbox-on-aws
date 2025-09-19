// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Autosuggest,
  SpaceBetween,
  Box,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";
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
  placeholder,
  disabled = false,
  existingUsers = [],
}: UserSearchInputProps) => {
  const { t } = useTranslation(['leases']);
  const defaultPlaceholder = t("users.addForm.searchPlaceholder");
  
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
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        empty={
          value.length >= 2 ? (
            <Box textAlign="center" color="text-body-secondary">
              {t("users.addForm.noUsersFound")}
            </Box>
          ) : (
            <Box textAlign="center" color="text-body-secondary">
              {t("users.addForm.typeToSearch")}
            </Box>
          )
        }
        loadingText={t("users.addForm.searchingUsers")}
        errorText={t("users.addForm.errorLoadingUsers")}
        recoveryText={t("users.addForm.retry")}
        enteredTextLabel={(value) => t("users.addForm.useValue", { value })}
      />
    </SpaceBetween>
  );
};
