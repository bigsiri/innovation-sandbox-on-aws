// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box } from "@cloudscape-design/components";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import styles from "./styles.module.scss";

interface ThresholdListContainerProps {
  children: React.ReactNode;
}

export const ThresholdListContainer = ({
  children,
}: ThresholdListContainerProps) => {
  const { t } = useTranslation('leases');
  
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Box>
          <Box>
            <strong>{t('thresholds.title')}</strong>
          </Box>
          <Box>
            <small data-muted>{t('thresholds.description')}</small>
          </Box>
        </Box>
        <Box />
        <Box>
          <Box>
            <strong>{t('thresholds.action.title')}</strong>
          </Box>
          <Box>
            <small data-muted>
              {t('thresholds.action.description')}
            </small>
          </Box>
        </Box>
      </div>
      {children}
    </div>
  );
};
