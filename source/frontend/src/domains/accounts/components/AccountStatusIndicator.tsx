// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SandboxAccountStatus } from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { getColor } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/helpers";
import { Box, Icon, Popover } from "@cloudscape-design/components";
import { colorChartsStatusHigh } from "@cloudscape-design/design-tokens";
import { getLocalizedMoment } from "@amzn/innovation-sandbox-frontend/helpers/moment";
import { useTranslation } from "react-i18next";

interface AccountStatusIndicatorProps {
  status: SandboxAccountStatus;
  lastCleanupStartTime: string;
}

export const AccountStatusIndicator = ({
  status,
  lastCleanupStartTime,
}: AccountStatusIndicatorProps) => {
  const { t } = useTranslation(['accounts']);
  const moment = getLocalizedMoment();
  
  switch (status) {
    case "Available":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-positive" /> {t("status.available")}
        </span>
      );

    case "Active":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-in-progress" /> {t("status.active")}
        </span>
      );

    case "Frozen":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-stopped" /> {t("status.frozen")}
        </span>
      );

    case "CleanUp": {
      const hoursElapsed = moment().diff(moment(lastCleanupStartTime), "hours");
      const isStale = hoursElapsed >= 24;
      const message = isStale
        ? t("status.cleanupStuck")
        : t("status.cleanupInProgress");
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
                {t("status.cleanupInitiated")}{`: ${moment(lastCleanupStartTime)}`}
              </Box>
            </div>
          }
        >
          <span
            style={{
              color,
            }}
          >
            <Icon name="remove" /> {t("status.cleanup")}
          </span>
        </Popover>
      );
    }

    case "Quarantine":
      return (
        <span style={{ color: getColor(status) }}>
          <Icon name="status-negative" /> {t("status.quarantine")}
        </span>
      );

    default:
      return null;
  }
};
