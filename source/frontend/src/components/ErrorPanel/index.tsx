// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Alert, Box, Button, SpaceBetween } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface ErrorPanelProps {
  header?: string;
  description?: string;
  retry?: () => void;
  error?: Error;
  showContactSupport?: boolean;
  showGoHome?: boolean;
}

export const ErrorPanel = ({
  header,
  description,
  retry,
  error,
  showContactSupport = false,
  showGoHome = false,
}: ErrorPanelProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const reLogin = () => {
    navigate(0);
  };

  // Determine if this is a session expired error
  const isSessionExpired = error && (
    error.toString().includes("403") || 
    error.toString().includes("401") ||
    error.toString().includes("Unauthorized")
  );

  // Determine if this is a network error
  const isNetworkError = error && (
    error.toString().includes("Network") ||
    error.toString().includes("fetch") ||
    error.toString().includes("timeout")
  );

  // Get appropriate error messages based on error type
  const getErrorContent = () => {
    if (isSessionExpired) {
      return {
        title: t('errors.authentication.title', { ns: 'common' }),
        description: description || t('errors.authentication.description', { ns: 'common' }),
        buttonText: t('errors.authentication.loginAgain', { ns: 'common' }),
        action: reLogin
      };
    }

    if (isNetworkError) {
      return {
        title: t('errors.network.title', { ns: 'common' }),
        description: description || t('errors.network.description', { ns: 'common' }),
        buttonText: t('errors.general.tryAgain', { ns: 'common' }),
        action: retry
      };
    }

    return {
      title: header || t('errors.general.title', { ns: 'common' }),
      description: description || t('errors.general.description', { ns: 'common' }),
      buttonText: t('errors.general.tryAgain', { ns: 'common' }),
      action: retry
    };
  };

  const errorContent = getErrorContent();

  const sessionExpiredAlert = (
    <Alert type="error" header={errorContent.title}>
      <Box margin={{ top: "xs" }}>{errorContent.description}</Box>
      <Box margin={{ top: "s" }}>
        <Button iconName="refresh" onClick={errorContent.action}>
          {errorContent.buttonText}
        </Button>
      </Box>
    </Alert>
  );

  const errorAlert = (
    <Alert type="error" header={errorContent.title}>
      <Box margin={{ top: "xs" }}>{errorContent.description}</Box>
      <Box margin={{ top: "s" }}>
        <SpaceBetween direction="horizontal" size="xs">
          {errorContent.action && (
            <Button iconName="refresh" onClick={errorContent.action}>
              {errorContent.buttonText}
            </Button>
          )}
          {showContactSupport && (
            <Button 
              variant="link" 
              onClick={() => {/* Implement contact support logic */}}
            >
              {t('errors.general.contactSupport', { ns: 'common' })}
            </Button>
          )}
          {showGoHome && (
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
            >
              {t('errors.general.goHome', { ns: 'common' })}
            </Button>
          )}
        </SpaceBetween>
      </Box>
    </Alert>
  );

  if (isSessionExpired) {
    return sessionExpiredAlert;
  } else {
    return errorAlert;
  }
};
