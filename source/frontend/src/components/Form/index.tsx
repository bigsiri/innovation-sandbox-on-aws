// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FormRenderer, FormRendererProps } from "@aws-northstar/ui";
import { useCallback, useMemo, useState, useEffect } from "react";

import {
  FormContext,
  FormErrors,
  FormValues,
} from "@amzn/innovation-sandbox-frontend/components/Form/context";
import { showErrorToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

import styles from "./styles.module.scss";
import "./wizard-buttons.scss";

export type FormProps = FormRendererProps & {
  insideTab?: boolean;
  errorHeader?: string;
};

export const Form = ({ insideTab, errorHeader, ...props }: FormProps) => {
  const { t } = useTranslation();
  const { t: tForms } = useTranslation('forms');
  const [formErrors, setFormErrors] = useState<FormErrors>();
  const [formValues, setFormValues] = useState<FormValues>(
    props.initialValues ?? {},
  );

  // Translate wizard buttons and table text after render
  useEffect(() => {
    const translateText = () => {
      // Translate buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const text = button.textContent?.trim();
        if (text === 'Cancel') button.textContent = tForms('actions.cancel');
        else if (text === 'Next') button.textContent = tForms('actions.next');
        else if (text === 'Previous') button.textContent = tForms('actions.previous');
        else if (text === 'Submit') button.textContent = tForms('actions.submit');
      });

      // Translate table empty/loading states
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.textContent?.trim() === 'No items to display') {
          element.textContent = t('actions.noItemsFound', { ns: 'common' });
        } else if (element.textContent?.trim() === 'Loading...') {
          element.textContent = t('actions.loading', { ns: 'common' });
        } else if (element.textContent?.trim() === 'Loading') {
          element.textContent = t('actions.loading', { ns: 'common' });
        }
      });
    };

    // Run translation after component mounts and updates
    const timer = setTimeout(translateText, 100);
    return () => clearTimeout(timer);
  });

  const handleValuesChange = useCallback(
    (values: Record<string, any>) => {
      // Schedule the state update for the next render cycle
      setTimeout(() => setFormValues(values));

      const errors = props.validate ? props.validate(values) : undefined;
      setFormErrors(errors as FormErrors);
      return errors;
    },
    [props.validate],
  );

  const onSubmit: FormRendererProps["onSubmit"] = async (...args) => {
    try {
      if (props.onSubmit) {
        await props.onSubmit(...args);
      }
    } catch (err: any) {
      const errorText = err.message ?? err.toString();
      const defaultErrorHeader = errorHeader || t('messages.somethingWentWrong', { ns: 'forms' });
      showErrorToast(errorText, defaultErrorHeader);
    }
  };

  const contextValues = useMemo(
    () => ({
      formValues,
      formErrors,
      t, // Provide translation function to form context
    }),
    [formValues, formErrors, t],
  );

  return (
    <FormContext.Provider value={contextValues}>
      <div
        className={
          insideTab && !props.schema.header ? styles.shiftUp : undefined
        }
      >
        <FormRenderer
          {...props}
          validate={handleValuesChange}
          onSubmit={onSubmit}
        />
      </div>
    </FormContext.Provider>
  );
};
