// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Container } from "@cloudscape-design/components";

import styles from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/styles.module.scss";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const AccountsLoading = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.middle}>
          <Loader label={t('widgets.accounts.loading', { ns: 'home' })} />
        </div>
      </div>
    </Container>
  );
};
