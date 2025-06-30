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
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

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

export const getStatusTitle = (status: SandboxAccountStatus, t: TranslationFunction): string => {
  switch (status) {
    case "Available":
      return t('status.available', { ns: 'accounts' });
    case "Active":
      return t('status.active', { ns: 'accounts' });
    case "Frozen":
      return t('status.frozen', { ns: 'accounts' });
    case "CleanUp":
      return t('status.cleanup', { ns: 'accounts' });
    case "Quarantine":
      return t('status.quarantine', { ns: 'accounts' });
    default:
      return status;
  }
};

export const convertAccountsToSummary = (accounts: SandboxAccount[], t: TranslationFunction) => {
  return Object.values(
    accounts.reduce(
      (summary, account) => {
        summary[account.status].value++;
        return summary;
      },
      {
        Available: {
          title: getStatusTitle("Available", t),
          status: "Available",
          value: 0,
          color: getColor("Available"),
        },
        Active: {
          title: getStatusTitle("Active", t),
          status: "Active",
          value: 0,
          color: getColor("Active"),
        },
        Frozen: {
          title: getStatusTitle("Frozen", t),
          status: "Frozen",
          value: 0,
          color: getColor("Frozen"),
        },
        CleanUp: {
          title: getStatusTitle("CleanUp", t),
          status: "CleanUp",
          value: 0,
          color: getColor("CleanUp"),
        },
        Quarantine: {
          title: getStatusTitle("Quarantine", t),
          status: "Quarantine",
          value: 0,
          color: getColor("Quarantine"),
        },
      } as Record<string, AccountStatusDatum>,
    ),
  );
};
