// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import styles from "./styles.module.scss";

interface FullPageLoaderProps {
  label?: string;
  context?: 'default' | 'application' | 'page' | 'content' | 'settings' | 'preferences' | 'dashboard';
  showSubtext?: boolean;
}

export const FullPageLoader = ({
  label,
  context = 'default',
  showSubtext = false,
}: FullPageLoaderProps) => {
  const { t } = useTranslation();

  // Get appropriate loading message based on context
  const getLoadingMessage = () => {
    if (label) {
      return label;
    }

    switch (context) {
      case 'application':
        return t('loading.loading.application', { ns: 'common' });
      case 'page':
        return t('loading.loading.page', { ns: 'common' });
      case 'content':
        return t('loading.loading.content', { ns: 'common' });
      case 'settings':
        return t('loading.loading.settings', { ns: 'common' });
      case 'preferences':
        return t('loading.loading.preferences', { ns: 'common' });
      case 'dashboard':
        return t('loading.loading.dashboard', { ns: 'common' });
      default:
        return t('loading.default', { ns: 'common' });
    }
  };

  const loadingMessage = getLoadingMessage();
  const subtextMessage = t('loading.please.wait', { ns: 'common' });

  return (
    <div className={styles.container}>
      <div className={styles.loader} />
      <div className={styles.label}>{loadingMessage}</div>
      {showSubtext && (
        <div className={styles.subtext}>{subtextMessage}</div>
      )}
    </div>
  );
};
