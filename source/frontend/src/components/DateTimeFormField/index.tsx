// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldInputProps } from "@aws-northstar/ui";
import {
  Box,
  DatePicker,
  FormField,
  SpaceBetween,
  TimeInput,
} from "@cloudscape-design/components";
import moment from "moment";
import { useState } from "react";

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface DateTimeFormFieldProps {
  input: FieldInputProps<string>;
  label?: string;
  description?: string;
  showError?: boolean;
  dateOnly?: boolean;
  timeOnly?: boolean;
  placeholder?: string;
  meta: {
    error?: string;
    submitFailed?: boolean;
  };
}

export const DateTimeFormField = ({
  input,
  label,
  description,
  showError,
  dateOnly = false,
  timeOnly = false,
  placeholder,
  meta: { error, submitFailed },
}: DateTimeFormFieldProps) => {
  const { t } = useTranslation();
  const shouldShowError = showError || (error && submitFailed);

  // Track date and time separately
  const [selectedDate, setSelectedDate] = useState<string>(
    input.value ? moment(input.value).format("YYYY-MM-DD") : "",
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    input.value ? moment(input.value).format("HH:mm") : "",
  );

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
    if (errorMessage.toLowerCase().includes('date')) {
      return t('validation.dateFormat', { ns: 'forms' });
    }
    if (errorMessage.toLowerCase().includes('time')) {
      return t('validation.timeFormat', { ns: 'forms' });
    }
    if (errorMessage.toLowerCase().includes('future')) {
      return t('validation.futureDate', { ns: 'forms' });
    }
    if (errorMessage.toLowerCase().includes('past')) {
      return t('validation.pastDate', { ns: 'forms' });
    }
    
    // Return original message if no translation found
    return errorMessage;
  };

  const onDateChange = (date: string) => {
    setSelectedDate(date);
    if (dateOnly) {
      // For date-only fields, set time to start of day
      const dateTime = moment(date).startOf('day');
      if (dateTime.isValid()) {
        input.onChange(dateTime.toISOString());
      } else {
        input.onChange(undefined);
      }
    } else {
      updateCombinedDateTime(date, selectedTime);
    }
  };

  const onTimeChange = (time: string) => {
    setSelectedTime(time);
    if (timeOnly) {
      // For time-only fields, use today's date
      const dateTime = moment(`${moment().format('YYYY-MM-DD')} ${time}`, "YYYY-MM-DD HH:mm");
      if (dateTime.isValid()) {
        input.onChange(dateTime.toISOString());
      } else {
        input.onChange(undefined);
      }
    } else {
      updateCombinedDateTime(selectedDate, time);
    }
  };

  const updateCombinedDateTime = (date: string, time: string) => {
    // Only combine if both date and time are valid
    if (date && time) {
      const combinedDateTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");

      if (combinedDateTime.isValid()) {
        input.onChange(combinedDateTime.toISOString());
        return;
      }
    }

    input.onChange(undefined);
  };

  // Get localized labels
  const getDateLabel = () => {
    if (dateOnly) return label || t('labels.date', { ns: 'forms' });
    return t('labels.date', { ns: 'forms' });
  };

  const getTimeLabel = () => {
    if (timeOnly) return label || t('labels.time', { ns: 'forms' });
    return t('labels.time', { ns: 'forms' });
  };

  // Get localized placeholders
  const getDatePlaceholder = () => {
    return placeholder || t('placeholders.selectDate', { ns: 'forms' });
  };

  const getTimePlaceholder = () => {
    return placeholder || t('placeholders.selectTime', { ns: 'forms' });
  };

  const translatedError = getTranslatedError(error);

  // Render date-only field
  if (dateOnly) {
    return (
      <FormField
        label={getDateLabel()}
        description={description}
        errorText={shouldShowError ? translatedError : null}
      >
        <DatePicker
          invalid={!!shouldShowError && !!error}
          onChange={({ detail: { value } }) => onDateChange(value)}
          value={selectedDate}
          placeholder={getDatePlaceholder()}
          ariaLabel={getDateLabel()}
        />
      </FormField>
    );
  }

  // Render time-only field
  if (timeOnly) {
    return (
      <FormField
        label={getTimeLabel()}
        description={description}
        errorText={shouldShowError ? translatedError : null}
      >
        <TimeInput
          invalid={!!shouldShowError && !!error}
          onChange={({ detail: { value } }) => onTimeChange(value)}
          format="hh:mm"
          value={selectedTime}
          placeholder={getTimePlaceholder()}
          ariaLabel={getTimeLabel()}
        />
      </FormField>
    );
  }

  // Render combined date-time field
  return (
    <FormField
      label={label || t('labels.dateTime', { ns: 'forms' })}
      description={description}
      errorText={shouldShowError ? translatedError : null}
    >
      <SpaceBetween size="xxs">
        <SpaceBetween size="l" direction="horizontal" alignItems="center">
          <Box>
            <small style={{ color: 'var(--color-text-body-secondary)', fontSize: '0.875rem' }}>
              {t('labels.date', { ns: 'forms' })}
            </small>
            <DatePicker
              invalid={!!shouldShowError && !!error}
              onChange={({ detail: { value } }) => onDateChange(value)}
              value={selectedDate}
              placeholder={getDatePlaceholder()}
              ariaLabel={t('labels.date', { ns: 'forms' })}
            />
          </Box>
          <Box>
            <small style={{ color: 'var(--color-text-body-secondary)', fontSize: '0.875rem' }}>
              {t('labels.time', { ns: 'forms' })}
            </small>
            <TimeInput
              invalid={!!shouldShowError && !!error}
              onChange={({ detail: { value } }) => onTimeChange(value)}
              format="hh:mm"
              value={selectedTime}
              placeholder={getTimePlaceholder()}
              ariaLabel={t('labels.time', { ns: 'forms' })}
            />
          </Box>
        </SpaceBetween>
      </SpaceBetween>
    </FormField>
  );
};
