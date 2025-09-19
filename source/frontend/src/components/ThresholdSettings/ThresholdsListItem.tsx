// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Box,
  Button,
  FormField,
  Select,
  SpaceBetween,
} from "@cloudscape-design/components";
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import { ThresholdAction } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { NumberInput } from "@amzn/innovation-sandbox-frontend/components/NumberInput";
import { getThresholdActionOptions } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/constants";
import { Threshold } from "@amzn/innovation-sandbox-frontend/components/ThresholdSettings/types";

import styles from "./styles.module.scss";

interface ThresholdsListItemProps {
  threshold: Threshold;
  label?: string;
  valueError?: string | null;
  actionError?: string | null;
  isCurrency?: boolean;
  isReadOnly?: boolean;
  onChange?: (threshold: Threshold) => void;
  onDelete?: () => void;
}

export const ThresholdsListItem = ({
  threshold,
  label,
  valueError,
  actionError,
  isCurrency,
  isReadOnly,
  onChange,
  onDelete,
}: ThresholdsListItemProps) => {
  const { t } = useTranslation();
  const thresholdActionOptions = getThresholdActionOptions(t);
  
  return (
    <div className={styles.row}>
      <Box>
        <SpaceBetween size="xs" direction="horizontal" alignItems="start">
          <div className={styles.cell}>{t("thresholds.when", { ns: "leases" })}</div>
          <Box>
            <FormField errorText={valueError}>
              <SpaceBetween size="xs" direction="horizontal" alignItems="start">
                <NumberInput
                  value={threshold.value}
                  isInvalid={!!valueError}
                  isCurrency={isCurrency}
                  isReadOnly={isReadOnly}
                  onChange={(value) => {
                    // update parent
                    if (onChange) {
                      onChange({ ...threshold, value: value ?? 0 });
                    }
                  }}
                />
                <div className={styles.cell}>{label}</div>
              </SpaceBetween>
            </FormField>
          </Box>
        </SpaceBetween>
      </Box>
      <div className={styles.arrow}>
        <FaArrowRight />
      </div>
      <FormField errorText={actionError}>
        {isReadOnly && (
          <Select
            selectedOption={
              thresholdActionOptions.find(
                (x) => x.value === threshold.action,
              ) ?? null
            }
            onChange={() => {}}
            readOnly
          />
        )}
        {!isReadOnly && (
          <Select
            options={thresholdActionOptions}
            selectedOption={
              thresholdActionOptions.find(
                (x) => x.value === threshold.action,
              ) ?? null
            }
            invalid={!!actionError}
            onChange={(event) => {
              if (onChange) {
                const newAction = event.detail.selectedOption
                  .value as ThresholdAction;

                onChange({ ...threshold, action: newAction });
              }
            }}
          />
        )}
      </FormField>
      {onDelete && (
        <Box>
          <Button
            iconName="remove"
            variant="icon"
            iconAlt="Remove"
            onClick={onDelete}
          />
        </Box>
      )}
    </div>
  );
};
