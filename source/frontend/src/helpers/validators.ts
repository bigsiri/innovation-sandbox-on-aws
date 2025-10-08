// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const validateNumber = (val: any, t?: (key: string, options?: any) => string) => {
  if (isNaN(val) || val.toString() === "") {
    return t ? t("validation.invalidNumber", { ns: "common" }) : "Please enter a valid number.";
  }
  if (val === 0) {
    return t ? t("validation.numberGreaterThanZero", { ns: "common" }) : "Please enter a number larger than 0";
  }
};
