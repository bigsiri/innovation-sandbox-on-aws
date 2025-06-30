// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, SpaceBetween } from "@cloudscape-design/components";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import styles from "./styles.module.scss";

interface LoaderProps {
  label?: string;
  context?: 'default' | 'saving' | 'processing' | 'uploading' | 'downloading' | 'validating' | 'authenticating' | 'connecting' | 'initializing' | 'refreshing' | 'searching' | 'filtering' | 'sorting';
  showLabel?: boolean;
}

export const Loader = ({ 
  label, 
  context = 'default',
  showLabel = true 
}: LoaderProps) => {
  const { t } = useTranslation();

  // Get appropriate loading message based on context
  const getLoadingMessage = () => {
    if (label) {
      return label;
    }

    switch (context) {
      case 'saving':
        return t('loading.saving', { ns: 'common' });
      case 'processing':
        return t('loading.processing', { ns: 'common' });
      case 'uploading':
        return t('loading.uploading', { ns: 'common' });
      case 'downloading':
        return t('loading.downloading', { ns: 'common' });
      case 'validating':
        return t('loading.validating', { ns: 'common' });
      case 'authenticating':
        return t('loading.authenticating', { ns: 'common' });
      case 'connecting':
        return t('loading.connecting', { ns: 'common' });
      case 'initializing':
        return t('loading.initializing', { ns: 'common' });
      case 'refreshing':
        return t('loading.refreshing', { ns: 'common' });
      case 'searching':
        return t('loading.searching', { ns: 'common' });
      case 'filtering':
        return t('loading.filtering', { ns: 'common' });
      case 'sorting':
        return t('loading.sorting', { ns: 'common' });
      default:
        return t('loading.default', { ns: 'common' });
    }
  };

  const loadingMessage = getLoadingMessage();

  return (
    <Box margin={{ bottom: "xs" }}>
      <SpaceBetween size="s" direction="horizontal" alignItems="center">
        <div className={styles.loaderContainer}>
          <span className={styles.loader} />
        </div>
        {showLabel && <span>{loadingMessage}</span>}
      </SpaceBetween>
    </Box>
  );
};
