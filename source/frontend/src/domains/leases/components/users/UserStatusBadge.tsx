// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Badge, Box, SpaceBetween } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

interface UserStatusBadgeProps {
  status?: "SUCCEEDED" | "FAILED";
  message?: string;
}

export const UserStatusBadge = ({ status, message }: UserStatusBadgeProps) => {
  const { t } = useTranslation();
  
  if (!status) {
    return <Badge color="grey">{t("users.statusUnknown", { ns: "leases" })}</Badge>;
  }

  const badgeProps = {
    SUCCEEDED: { color: "green" as const, text: t("users.statusActive", { ns: "leases" }) },
    FAILED: { color: "red" as const, text: t("users.statusFailed", { ns: "leases" }) },
  };

  const { color, text } = badgeProps[status];

  return (
    <SpaceBetween direction="vertical" size="xs">
      <Badge color={color}>{text}</Badge>
      {status === "FAILED" && message && (
        <Box fontSize="body-s" color="text-status-error">
          {message}
        </Box>
      )}
    </SpaceBetween>
  );
};
