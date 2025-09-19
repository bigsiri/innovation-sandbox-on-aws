// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";

interface ThresholdListContainerProps {
  children: React.ReactNode;
}

export const ThresholdListContainer = ({
  children,
}: ThresholdListContainerProps) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Box>
          <Box>
            <strong>{t("thresholds.threshold", { ns: "leases" })}</strong>
          </Box>
          <Box>
            <small data-muted>{t("thresholds.thresholdDescription", { ns: "leases" })}</small>
          </Box>
        </Box>
        <Box />
        <Box>
          <Box>
            <strong>{t("thresholds.action", { ns: "leases" })}</strong>
          </Box>
          <Box>
            <small data-muted>
              {t("thresholds.actionDescription", { ns: "leases" })}
            </small>
          </Box>
        </Box>
      </div>
      {children}
    </div>
  );
};
