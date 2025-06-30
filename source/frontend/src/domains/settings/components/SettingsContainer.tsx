// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Alert,
  Box,
  Container,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";
import { ReactNode } from "react";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface SettingsContainerProps {
  children: ReactNode;
}

export const SettingsContainer = ({ children }: SettingsContainerProps) => {
  const { t } = useTranslation();

  return (
    <Box data-top data-settings-form>
      <Container>
        <SpaceBetween size="l">
          <Alert type="info">
            {t('general.appConfig.info', { ns: 'settings' })}{" "}
            <Link
              external
              href="https://console.aws.amazon.com/systems-manager/appconfig/applications"
            >
              {t('general.appConfig.link', { ns: 'settings' })}
            </Link>
          </Alert>
          <Box>{children}</Box>
        </SpaceBetween>
      </Container>
    </Box>
  );
};
