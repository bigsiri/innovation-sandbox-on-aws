// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, SpaceBetween } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import styles from "./styles.module.scss";

interface LoaderProps {
  label?: string;
}

export const Loader = ({ label }: LoaderProps) => {
  const { t } = useTranslation('common');
  const displayLabel = label || t('loading', { defaultValue: 'Loading...' });
  
  return (
    <Box margin={{ bottom: "xs" }}>
      <SpaceBetween size="s" direction="horizontal" alignItems="center">
        <div className={styles.loaderContainer}>
          <span className={styles.loader} />
        </div>
        <span>{displayLabel}</span>
      </SpaceBetween>
    </Box>
  );
};
