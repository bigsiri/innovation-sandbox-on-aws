// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Button, ButtonProps } from "@cloudscape-design/components";
import { useEffect, useState } from "react";

import { showErrorToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface AccountLoginLinkProps {
  variant?: ButtonProps.Variant;
  accountId: string;
}

export const AccountLoginLink = ({
  variant = "inline-link",
  accountId,
}: AccountLoginLinkProps) => {
  const { t } = useTranslation();
  const [clicked, setClicked] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>();

  // fetch config from app config
  const {
    data: config,
    isFetching,
    isFetched,
    isError,
  } = useGetConfigurations();

  const onClick = () => {
    setClicked(true);
    openLink();
  };

  const openLink = (authBaseUrl = baseUrl) => {
    if (isError) {
      return showErrorToast(
        t('accountLogin.errors.failedToRetrieveUrl', { ns: 'common' }),
      );
    }

    if (!isFetched) {
      return;
    }

    // show error when base url is not set in config
    if (!authBaseUrl) {
      return showErrorToast(
        t('accountLogin.errors.urlNotConfigured', { ns: 'common' }),
      );
    }

    // show error when base url is not valid (e.g. when app config is first deployed with dummy values)
    if (!authBaseUrl.startsWith("https://")) {
      return showErrorToast(
        t('accountLogin.errors.invalidUrl', { ns: 'common' }),
      );
    }

    const url = `${authBaseUrl}/#/console?account_id=${accountId}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (config) {
      // after config is loaded, set base url in state
      const baseUrl = config.auth.awsAccessPortalUrl;
      setBaseUrl(baseUrl);

      // if button was clicked while loading, open the link
      if (clicked) {
        // have to pass baseUrl as arg here even though we set it in state because of react lifecycle
        openLink(baseUrl);
      }
    }
  }, [config]);

  if (clicked && isFetching) {
    return (
      <Button disabled={true} iconName="external" variant={variant} loading>
        {t('accountLogin.loading', { ns: 'common' })}
      </Button>
    );
  }

  return (
    <Button onClick={onClick} iconName="external" variant={variant}>
      {t('accountLogin.loginToAccount', { ns: 'common' })}
    </Button>
  );
};
