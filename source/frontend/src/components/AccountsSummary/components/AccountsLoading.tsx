// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Container } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import styles from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/styles.module.scss";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";

export const AccountsLoading = () => {
  const { t } = useTranslation('accounts');
  
  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.middle}>
          <Loader label={t("loadingAccountInfo")} />
        </div>
      </div>
    </Container>
  );
};
