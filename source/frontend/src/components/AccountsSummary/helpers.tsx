// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SandboxAccount,
  SandboxAccountStatus,
} from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { PieChartProps } from "@cloudscape-design/components";
import {
  colorChartsPaletteCategorical16,
  colorChartsStatusHigh,
  colorChartsStatusInfo,
  colorChartsStatusLow,
  colorChartsStatusPositive,
} from "@cloudscape-design/design-tokens";

export type AccountStatusDatum = PieChartProps.Datum & {
  status?: SandboxAccountStatus;
};

export const getColor = (status?: SandboxAccountStatus) => {
  switch (status) {
    case "Available":
      return colorChartsStatusPositive;
    case "Active":
      return colorChartsStatusInfo;
    case "Frozen":
      return colorChartsPaletteCategorical16;
    case "CleanUp":
      return colorChartsStatusLow;
    case "Quarantine":
      return colorChartsStatusHigh;
  }
};

export const convertAccountsToSummary = (accounts: SandboxAccount[], t?: any) => {
  return Object.values(
    accounts.reduce(
      (summary, account) => {
        summary[account.status].value++;
        return summary;
      },
      {
        Available: {
          title: t ? t("accountStatus.available") : "Available",
          status: "Available",
          value: 0,
          color: getColor("Available"),
        },
        Active: {
          title: t ? t("accountStatus.active") : "Active",
          status: "Active",
          value: 0,
          color: getColor("Active"),
        },
        Frozen: {
          title: t ? t("accountStatus.frozen") : "Frozen",
          status: "Frozen",
          value: 0,
          color: getColor("Frozen"),
        },
        CleanUp: {
          title: t ? t("accountStatus.cleanUp") : "Clean Up",
          status: "CleanUp",
          value: 0,
          color: getColor("CleanUp"),
        },
        Quarantine: {
          title: t ? t("accountStatus.quarantine") : "Quarantine",
          status: "Quarantine",
          value: 0,
          color: getColor("Quarantine"),
        },
      } as Record<string, AccountStatusDatum>,
    ),
  );
};
