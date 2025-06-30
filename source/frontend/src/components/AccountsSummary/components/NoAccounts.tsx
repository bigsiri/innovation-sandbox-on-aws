// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  Container,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";

import styles from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/styles.module.scss";
import Animate from "@amzn/innovation-sandbox-frontend/components/Animate";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const NoAccounts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.middle}>
          <Animate>
            <SpaceBetween size="m" alignItems="center">
              <StatusIndicator type="warning">
                {t('noAccounts.title', { ns: 'accounts' })}
              </StatusIndicator>
              <Box>
                {t('noAccounts.description', { ns: 'accounts' })}
              </Box>
              <Button onClick={() => navigate("/accounts/new")}>
                {t('noAccounts.action', { ns: 'accounts' })}
              </Button>
            </SpaceBetween>
          </Animate>
        </div>
      </div>
    </Container>
  );
};
