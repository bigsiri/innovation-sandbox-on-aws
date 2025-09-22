// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StatusIndicator } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

interface BudgetStatusProps {
  maxSpend?: number;
}

export const BudgetStatus = ({ maxSpend }: BudgetStatusProps) => {
  const { t } = useTranslation();
  
  return (
    <>
      {maxSpend ? (
        formatCurrency(maxSpend)
      ) : (
        <StatusIndicator type="info">{t("noMaxBudget", { ns: "common" })}</StatusIndicator>
      )}
    </>
  );
};
