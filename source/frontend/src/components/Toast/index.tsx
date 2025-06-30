// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import classNames from "classnames";
import { Flip, toast } from "react-toastify/unstyled";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import styles from "./styles.module.scss";

interface ToastMessageProps {
  description: string;
  title?: string;
}

const ToastMessage = ({ description, title }: ToastMessageProps) => {
  return (
    <div className={styles.container}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.description}>{description}</div>
    </div>
  );
};

const commonSettings = {
  autoClose: 5000,
  className: styles.toast,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
  transition: Flip,
};

// Enhanced toast functions with translation support
export const showErrorToast = (description: string, title?: string) => {
  toast.error(<ToastMessage description={description} title={title} />, {
    ...commonSettings,
    autoClose: false,
    position: "bottom-right",
    className: classNames(styles.toast, styles.error),
  });
};

export const showSuccessToast = (description: string, title?: string) => {
  toast.success(<ToastMessage description={description} title={title} />, {
    ...commonSettings,
    className: classNames(styles.toast, styles.success, styles.top),
    autoClose: 3000,
    position: "top-right",
  });
};

export const showWarningToast = (description: string, title?: string) => {
  toast.warning(<ToastMessage description={description} title={title} />, {
    ...commonSettings,
    className: classNames(styles.toast, styles.warning),
    autoClose: 4000,
    position: "top-right",
  });
};

export const showInfoToast = (description: string, title?: string) => {
  toast.info(<ToastMessage description={description} title={title} />, {
    ...commonSettings,
    className: classNames(styles.toast, styles.info),
    autoClose: 4000,
    position: "top-right",
  });
};

// Translation-aware toast functions
export const useToast = () => {
  const { t } = useTranslation();

  return {
    showError: (descriptionKey: string, titleKey?: string, options?: { ns?: 'common' | 'leases' | 'accounts' | 'settings' | 'home'; replace?: Record<string, any> }) => {
      const description = t(descriptionKey, { ns: options?.ns || 'common', replace: options?.replace });
      const title = titleKey ? t(titleKey, { ns: options?.ns || 'common', replace: options?.replace }) : undefined;
      showErrorToast(description, title);
    },

    showSuccess: (descriptionKey: string, titleKey?: string, options?: { ns?: 'common' | 'leases' | 'accounts' | 'settings' | 'home'; replace?: Record<string, any> }) => {
      const description = t(descriptionKey, { ns: options?.ns || 'common', replace: options?.replace });
      const title = titleKey ? t(titleKey, { ns: options?.ns || 'common', replace: options?.replace }) : undefined;
      showSuccessToast(description, title);
    },

    showWarning: (descriptionKey: string, titleKey?: string, options?: { ns?: 'common' | 'leases' | 'accounts' | 'settings' | 'home'; replace?: Record<string, any> }) => {
      const description = t(descriptionKey, { ns: options?.ns || 'common', replace: options?.replace });
      const title = titleKey ? t(titleKey, { ns: options?.ns || 'common', replace: options?.replace }) : undefined;
      showWarningToast(description, title);
    },

    showInfo: (descriptionKey: string, titleKey?: string, options?: { ns?: 'common' | 'leases' | 'accounts' | 'settings' | 'home'; replace?: Record<string, any> }) => {
      const description = t(descriptionKey, { ns: options?.ns || 'common', replace: options?.replace });
      const title = titleKey ? t(titleKey, { ns: options?.ns || 'common', replace: options?.replace }) : undefined;
      showInfoToast(description, title);
    },

    // Convenience methods for common notifications
    showSaveSuccess: () => {
      const description = t('notifications.success.saved', { ns: 'common' });
      const title = t('notifications.success.title', { ns: 'common' });
      showSuccessToast(description, title);
    },

    showSaveError: () => {
      const description = t('notifications.error.saveFailed', { ns: 'common' });
      const title = t('notifications.error.title', { ns: 'common' });
      showErrorToast(description, title);
    },

    showDeleteSuccess: () => {
      const description = t('notifications.success.deleted', { ns: 'common' });
      const title = t('notifications.success.title', { ns: 'common' });
      showSuccessToast(description, title);
    },

    showDeleteError: () => {
      const description = t('notifications.error.deleteFailed', { ns: 'common' });
      const title = t('notifications.error.title', { ns: 'common' });
      showErrorToast(description, title);
    },

    showNetworkError: () => {
      const description = t('notifications.error.networkError', { ns: 'common' });
      const title = t('notifications.error.title', { ns: 'common' });
      showErrorToast(description, title);
    },

    showUnsavedChanges: () => {
      const description = t('notifications.warning.unsavedChanges', { ns: 'common' });
      const title = t('notifications.warning.title', { ns: 'common' });
      showWarningToast(description, title);
    },

    showCopySuccess: () => {
      const description = t('notifications.success.copied', { ns: 'common' });
      showSuccessToast(description);
    },

    showCopyError: () => {
      const description = t('notifications.error.copyFailed', { ns: 'common' });
      showErrorToast(description);
    }
  };
};
