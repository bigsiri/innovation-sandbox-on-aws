// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createContext, useContext } from "react";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

export type FormValues = Record<string, any>;
export type FormErrors = Record<string, string>;
export type FormInfo = {
  formValues: FormValues;
  formErrors?: FormErrors;
  t?: TranslationFunction; // Add translation function to context
};

export const FormContext = createContext<FormInfo>({
  formValues: {},
  formErrors: {},
});

export const useFormContext = () => useContext(FormContext);
