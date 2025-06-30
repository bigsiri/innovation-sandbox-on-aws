// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldInputProps } from "@aws-northstar/ui";
import { FormField, SpaceBetween } from "@cloudscape-design/components";

import { NumberInput } from "@amzn/innovation-sandbox-frontend/components/NumberInput";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface NumberFormFieldProps {
  input: FieldInputProps<number>;
  label?: string;
  description?: string;
  showError?: boolean;
  isCurrency?: boolean;
  helperText?: string;
  endText?: string;
  placeholder?: string;
  meta: {
    error?: string;
    submitFailed?: boolean;
  };
}

export const NumberFormField = ({
  input,
  label,
  description,
  showError,
  helperText,
  endText,
  isCurrency,
  meta: { error, submitFailed },
}: NumberFormFieldProps) => {
  const { t } = useTranslation();
  const shouldShowError = showError || (error && submitFailed);

  // Translate error message if it's a known validation key
  const getTranslatedError = (errorMessage?: string) => {
    if (!errorMessage) return null;
    
    // Check if it's a translation key
    if (errorMessage.includes('.')) {
      return t(errorMessage, { ns: 'forms' });
    }
    
    // Check for common validation patterns
    if (errorMessage.toLowerCase().includes('required')) {
      return t('validation.required', { ns: 'forms' });
    }
    if (errorMessage.toLowerCase().includes('number')) {
      return t('validation.number', { ns: 'forms' });
    }
    if (errorMessage.toLowerCase().includes('positive')) {
      return t('validation.positive', { ns: 'forms' });
    }
    
    // Return original message if no translation found
    return errorMessage;
  };

  const translatedError = getTranslatedError(error);

  return (
    <FormField
      label={label}
      description={description}
      errorText={shouldShowError ? translatedError : null}
    >
      <SpaceBetween size="xxs">
        <SpaceBetween size="xs" direction="horizontal" alignItems="center">
          <NumberInput
            isInvalid={!!shouldShowError && !!error}
            isCurrency={isCurrency}
            onChange={input.onChange}
            value={input.value}
          />
          {endText && <span>{endText}</span>}
        </SpaceBetween>
        {helperText && (
          <div data-helper-text style={{ fontSize: '0.875rem', color: 'var(--color-text-body-secondary)' }}>
            {helperText}
          </div>
        )}
      </SpaceBetween>
    </FormField>
  );
};
