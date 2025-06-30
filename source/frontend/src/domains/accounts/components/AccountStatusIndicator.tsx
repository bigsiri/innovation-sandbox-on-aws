// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SandboxAccountStatus } from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { getColor } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/helpers";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatDate } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";
import { Box, Icon, Popover } from "@cloudscape-design/components";
import { colorChartsStatusHigh } from "@cloudscape-design/design-tokens";
import moment from "moment";

interface AccountStatusIndicatorProps {
  status: SandboxAccountStatus;
  lastCleanupStartTime: string;
}

export const AccountStatusIndicator = ({
  status,
  lastCleanupStartTime,
}: AccountStatusIndicatorProps) => {
  const { t, currentLanguage } = useTranslation();

  switch (status) {
    case "Available":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-positive" /> {t('status.available', { ns: 'accounts' })}
        </span>
      );

    case "Active":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-in-progress" /> {t('status.active', { ns: 'accounts' })}
        </span>
      );

    case "Frozen":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-stopped" /> {t('status.frozen', { ns: 'accounts' })}
        </span>
      );

    case "CleanUp": {
      const hoursElapsed = moment().diff(moment(lastCleanupStartTime), "hours");
      const isStale = hoursElapsed >= 24;
      const message = isStale
        ? t('status.messages.cleanupStuck', { ns: 'accounts' })
        : t('status.messages.cleanup', { ns: 'accounts' });
      const color = isStale ? colorChartsStatusHigh : getColor(status);

      return (
        <Popover
          position="top"
          size="large"
          dismissButton={false}
          content={
            <div style={{ color }}>
              {message}
              <Box color={"inherit"} fontWeight={"heavy"}>
                {t('status.messages.cleanupInitiated', { ns: 'accounts' })}{` ${formatDate(new Date(lastCleanupStartTime), 'medium', currentLanguage)}`}
              </Box>
            </div>
          }
        >
          <span
            style={{
              color,
            }}
          >
            <Icon name="remove" /> {t('status.cleanup', { ns: 'accounts' })}
          </span>
        </Popover>
      );
    }

    case "Quarantine":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-negative" /> {t('status.quarantine', { ns: 'accounts' })}
        </span>
      );

    default:
      return (
        <span style={{ color: getColor('Available') }}>
          <Icon name="status-info" /> {t('status.unknown', { ns: 'accounts' })}
        </span>
      );
  }
};
