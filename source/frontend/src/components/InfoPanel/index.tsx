// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button } from "@cloudscape-design/components";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface InfoPanelProps {
  header: string;
  type?: "info" | "warning";
  description?: string;
  actionLabel?: string;
  action?: () => void;
  showDefaultAction?: boolean;
  context?: 'noData' | 'noResults' | 'emptyState' | 'comingSoon' | 'maintenance' | 'general';
}

export const InfoPanel = ({
  header,
  type = "info",
  description,
  actionLabel,
  action,
  showDefaultAction = true,
  context = 'general',
}: InfoPanelProps) => {
  const { t } = useTranslation();

  // Get appropriate default action label based on context
  const getDefaultActionLabel = () => {
    if (actionLabel) {
      return actionLabel;
    }

    switch (context) {
      case 'noData':
      case 'noResults':
      case 'emptyState':
        return t('refresh', { ns: 'common' });
      case 'comingSoon':
        return t('ok', { ns: 'common' });
      case 'maintenance':
        return t('retry', { ns: 'common' });
      default:
        return t('ok', { ns: 'common' });
    }
  };

  const defaultActionLabel = getDefaultActionLabel();

  return (
    <Alert type={type} header={header}>
      {description && <Box margin={{ top: "xs" }}>{description}</Box>}
      {(action || showDefaultAction) && (
        <Box margin={{ top: "s" }}>
          <Button onClick={() => action?.()}>
            {defaultActionLabel}
          </Button>
        </Box>
      )}
    </Alert>
  );
};
