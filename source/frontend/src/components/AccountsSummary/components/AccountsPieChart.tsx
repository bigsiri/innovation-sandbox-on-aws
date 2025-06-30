// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";

import {
  SandboxAccount,
  SandboxAccountStatus,
} from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { convertAccountsToSummary } from "@amzn/innovation-sandbox-frontend/components/AccountsSummary/helpers";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { PieChart } from "@cloudscape-design/components";

interface AccountsPieChartProps {
  accounts: SandboxAccount[];
  filter?: SandboxAccountStatus;
  onClick?: (status?: SandboxAccountStatus) => void;
}

export const AccountsPieChart = ({ accounts }: AccountsPieChartProps) => {
  const { t } = useTranslation();
  
  const summary = useMemo(() => {
    return convertAccountsToSummary(accounts, t).filter((item) => item.value > 0);
  }, [accounts, t]);

  return (
    <PieChart
      data={summary}
      variant="donut"
      segmentDescription={(datum, sum) =>
        `${datum.value} ${t('summary.accounts', { ns: 'accounts' })}, ${((datum.value / sum) * 100).toFixed(0)}%`
      }
      hideFilter={true}
      hideLegend
    />
  );
};
