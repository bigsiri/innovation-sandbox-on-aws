// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import i18n from "@amzn/innovation-sandbox-frontend/i18n";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

// Legacy validator for backward compatibility
export const validateNumber = (val: any) => {
  if (isNaN(val) || val.toString() === "") {
    return i18n.t('validation.invalidNumber', { ns: 'common' });
  }
  if (val === 0) {
    return i18n.t('validation.numberGreaterThanZero', { ns: 'common' });
  }
};

// Translation-aware validators
export const createValidators = (t: TranslationFunction) => {
  return {
    // Required field validator
    required: (value: any) => {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        return t('validation.required', { ns: 'forms' });
      }
      return undefined;
    },

    // Email validator
    email: (value: string) => {
      if (!value) return undefined;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t('validation.email', { ns: 'forms' });
      }
      return undefined;
    },

    // URL validator
    url: (value: string) => {
      if (!value) return undefined;
      try {
        new URL(value);
        return undefined;
      } catch {
        return t('validation.url', { ns: 'forms' });
      }
    },

    // Number validators
    number: (value: any) => {
      if (value === undefined || value === null || value === '') return undefined;
      if (isNaN(value)) {
        return t('validation.number', { ns: 'forms' });
      }
      return undefined;
    },

    integer: (value: any) => {
      if (value === undefined || value === null || value === '') return undefined;
      if (isNaN(value) || !Number.isInteger(Number(value))) {
        return t('validation.integer', { ns: 'forms' });
      }
      return undefined;
    },

    positive: (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value <= 0) {
        return t('validation.positive', { ns: 'forms' });
      }
      return undefined;
    },

    negative: (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value >= 0) {
        return t('validation.negative', { ns: 'forms' });
      }
      return undefined;
    },

    nonZero: (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value === 0) {
        return t('validation.nonZero', { ns: 'forms' });
      }
      return undefined;
    },

    greaterThanZero: (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value <= 0) {
        return t('validation.greaterThanZero', { ns: 'forms' });
      }
      return undefined;
    },

    // String length validators
    minLength: (min: number) => (value: string) => {
      if (!value) return undefined;
      if (value.length < min) {
        return t('validation.minLength', { ns: 'forms', replace: { min } });
      }
      return undefined;
    },

    maxLength: (max: number) => (value: string) => {
      if (!value) return undefined;
      if (value.length > max) {
        return t('validation.maxLength', { ns: 'forms', replace: { max } });
      }
      return undefined;
    },

    exactLength: (length: number) => (value: string) => {
      if (!value) return undefined;
      if (value.length !== length) {
        return t('validation.exactLength', { ns: 'forms', replace: { length } });
      }
      return undefined;
    },

    // Numeric range validators
    minValue: (min: number) => (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value < min) {
        return t('validation.minValue', { ns: 'forms', replace: { min } });
      }
      return undefined;
    },

    maxValue: (max: number) => (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value > max) {
        return t('validation.maxValue', { ns: 'forms', replace: { max } });
      }
      return undefined;
    },

    range: (min: number, max: number) => (value: number) => {
      if (value === undefined || value === null) return undefined;
      if (value < min || value > max) {
        return t('validation.range', { ns: 'forms', replace: { min, max } });
      }
      return undefined;
    },

    // Pattern validators
    pattern: (regex: RegExp) => (value: string) => {
      if (!value) return undefined;
      if (!regex.test(value)) {
        return t('validation.pattern', { ns: 'forms' });
      }
      return undefined;
    },

    alphanumeric: (value: string) => {
      if (!value) return undefined;
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(value)) {
        return t('validation.alphanumeric', { ns: 'forms' });
      }
      return undefined;
    },

    alphabetic: (value: string) => {
      if (!value) return undefined;
      const alphabeticRegex = /^[a-zA-Z]+$/;
      if (!alphabeticRegex.test(value)) {
        return t('validation.alphabetic', { ns: 'forms' });
      }
      return undefined;
    },

    numeric: (value: string) => {
      if (!value) return undefined;
      const numericRegex = /^[0-9]+$/;
      if (!numericRegex.test(value)) {
        return t('validation.numeric', { ns: 'forms' });
      }
      return undefined;
    },

    // Date validators
    dateFormat: (value: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return t('validation.dateFormat', { ns: 'forms' });
      }
      return undefined;
    },

    futureDate: (value: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        return t('validation.futureDate', { ns: 'forms' });
      }
      return undefined;
    },

    pastDate: (value: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      const now = new Date();
      if (date >= now) {
        return t('validation.pastDate', { ns: 'forms' });
      }
      return undefined;
    },

    // Password validators
    passwordStrength: (value: string) => {
      if (!value) return undefined;
      const hasMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      
      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumbers) {
        return t('validation.passwordStrength', { ns: 'forms' });
      }
      return undefined;
    },

    passwordMatch: (confirmPassword: string) => (password: string) => {
      if (!password || !confirmPassword) return undefined;
      if (password !== confirmPassword) {
        return t('validation.passwordMatch', { ns: 'forms' });
      }
      return undefined;
    },

    // File validators
    fileSize: (maxSize: number) => (file: File) => {
      if (!file) return undefined;
      if (file.size > maxSize) {
        const sizeInMB = Math.round(maxSize / (1024 * 1024));
        return t('validation.fileSize', { ns: 'forms', replace: { size: `${sizeInMB}MB` } });
      }
      return undefined;
    },

    fileType: (allowedTypes: string[]) => (file: File) => {
      if (!file) return undefined;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return t('validation.fileType', { ns: 'forms', replace: { types: allowedTypes.join(', ') } });
      }
      return undefined;
    },

    // Composite validators
    compose: (...validators: Array<(value: any) => string | undefined>) => (value: any) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return undefined;
    },

    // Conditional validator
    when: (condition: (value: any) => boolean, validator: (value: any) => string | undefined) => 
      (value: any) => {
        if (condition(value)) {
          return validator(value);
        }
        return undefined;
      },
  };
};

// Hook to get validators with translation support
export const useValidators = (t: TranslationFunction) => {
  return createValidators(t);
};

// Common validation combinations
export const createCommonValidators = (t: TranslationFunction) => {
  const validators = createValidators(t);
  
  return {
    requiredEmail: validators.compose(validators.required, validators.email),
    requiredNumber: validators.compose(validators.required, validators.number),
    requiredPositiveNumber: validators.compose(
      validators.required, 
      validators.number, 
      validators.positive
    ),
    requiredString: validators.compose(validators.required, validators.minLength(1)),
    optionalEmail: validators.email,
    optionalUrl: validators.url,
    strongPassword: validators.compose(validators.required, validators.passwordStrength),
  };
};
