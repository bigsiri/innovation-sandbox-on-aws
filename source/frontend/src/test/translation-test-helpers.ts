// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen } from '@testing-library/react';
import { mockTranslations } from './mock-translations';
import { SupportedLanguages } from '../i18n/types';

/**
 * Utility functions for testing translations
 */

/**
 * Validates that a translation key exists in the mock translations
 */
export const validateTranslationKeyExists = (
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common'
): boolean => {
  const translations = mockTranslations[language];
  const namespaceTranslations = translations[namespace as keyof typeof translations];
  
  if (!namespaceTranslations) {
    return false;
  }
  
  // Handle nested keys (e.g., 'languageSwitcher.ariaLabel')
  const keyParts = key.split('.');
  let current: any = namespaceTranslations;
  
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }
  
  return typeof current === 'string';
};

/**
 * Gets the expected translation for a key
 */
export const getExpectedTranslation = (
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common',
  options?: {
    count?: number;
    replace?: Record<string, any>;
  }
): string => {
  const translations = mockTranslations[language];
  const namespaceTranslations = translations[namespace as keyof typeof translations];
  
  if (!namespaceTranslations) {
    return key;
  }
  
  // Handle nested keys
  const keyParts = key.split('.');
  let current: any = namespaceTranslations;
  
  for (const part of keyParts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  
  if (typeof current !== 'string') {
    return key;
  }
  
  let result = current;
  
  // Handle pluralization
  if (options?.count !== undefined) {
    const pluralKey = options.count === 1 ? `${key}_one` : `${key}_other`;
    const pluralKeyParts = pluralKey.split('.');
    let pluralCurrent: any = namespaceTranslations;
    
    for (const part of pluralKeyParts) {
      if (pluralCurrent && typeof pluralCurrent === 'object' && part in pluralCurrent) {
        pluralCurrent = pluralCurrent[part];
      } else {
        break;
      }
    }
    
    if (typeof pluralCurrent === 'string') {
      result = pluralCurrent;
    }
  }
  
  // Handle interpolation
  if (options?.replace) {
    Object.entries(options.replace).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
    });
  }
  
  // Handle count interpolation
  if (options?.count !== undefined) {
    result = result.replace(/{{count}}/g, String(options.count));
  }
  
  return result;
};

/**
 * Tests pluralization for a given key
 */
export const testPluralization = (
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common'
) => {
  const singularTranslation = getExpectedTranslation(key, language, namespace, { count: 1 });
  const pluralTranslation = getExpectedTranslation(key, language, namespace, { count: 5 });
  
  return {
    singular: singularTranslation,
    plural: pluralTranslation,
    isDifferent: singularTranslation !== pluralTranslation
  };
};

/**
 * Tests interpolation for a given key
 */
export const testInterpolation = (
  key: string,
  replacements: Record<string, any>,
  language: SupportedLanguages = 'en',
  namespace: string = 'common'
) => {
  const withoutInterpolation = getExpectedTranslation(key, language, namespace);
  const withInterpolation = getExpectedTranslation(key, language, namespace, { replace: replacements });
  
  return {
    original: withoutInterpolation,
    interpolated: withInterpolation,
    hasInterpolation: withoutInterpolation !== withInterpolation
  };
};

/**
 * Asserts that text content exists in the document for a given language
 */
export const expectTranslatedText = (
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common',
  options?: {
    count?: number;
    replace?: Record<string, any>;
  }
) => {
  const expectedText = getExpectedTranslation(key, language, namespace, options);
  const element = screen.getByText(expectedText);
  if (!element) {
    throw new Error(`Expected text "${expectedText}" not found in document`);
  }
  return expectedText;
};

/**
 * Asserts that text content exists in the document (case insensitive)
 */
export const expectTranslatedTextIgnoreCase = (
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common',
  options?: {
    count?: number;
    replace?: Record<string, any>;
  }
) => {
  const expectedText = getExpectedTranslation(key, language, namespace, options);
  const element = screen.getByText(new RegExp(expectedText, 'i'));
  if (!element) {
    throw new Error(`Expected text "${expectedText}" not found in document (case insensitive)`);
  }
  return expectedText;
};

/**
 * Asserts that an element has the correct translated aria-label
 */
export const expectTranslatedAriaLabel = (
  element: HTMLElement,
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common',
  options?: {
    count?: number;
    replace?: Record<string, any>;
  }
) => {
  const expectedLabel = getExpectedTranslation(key, language, namespace, options);
  const actualLabel = element.getAttribute('aria-label');
  if (actualLabel !== expectedLabel) {
    throw new Error(`Expected aria-label "${expectedLabel}" but got "${actualLabel}"`);
  }
  return expectedLabel;
};

/**
 * Asserts that an element has the correct translated placeholder
 */
export const expectTranslatedPlaceholder = (
  element: HTMLElement,
  key: string,
  language: SupportedLanguages = 'en',
  namespace: string = 'common',
  options?: {
    count?: number;
    replace?: Record<string, any>;
  }
) => {
  const expectedPlaceholder = getExpectedTranslation(key, language, namespace, options);
  const actualPlaceholder = element.getAttribute('placeholder');
  if (actualPlaceholder !== expectedPlaceholder) {
    throw new Error(`Expected placeholder "${expectedPlaceholder}" but got "${actualPlaceholder}"`);
  }
  return expectedPlaceholder;
};

/**
 * Validates that all required translation keys exist for both languages
 */
export const validateBilingualTranslations = (
  keys: string[],
  namespace: string = 'common'
): {
  valid: boolean;
  missing: {
    en: string[];
    'fr-CA': string[];
  };
} => {
  const missing = {
    en: [] as string[],
    'fr-CA': [] as string[]
  };
  
  keys.forEach(key => {
    if (!validateTranslationKeyExists(key, 'en', namespace)) {
      missing.en.push(key);
    }
    if (!validateTranslationKeyExists(key, 'fr-CA', namespace)) {
      missing['fr-CA'].push(key);
    }
  });
  
  return {
    valid: missing.en.length === 0 && missing['fr-CA'].length === 0,
    missing
  };
};

/**
 * Helper to test date formatting in different locales
 */
export const testDateFormatting = (
  date: Date | string,
  formatType: 'short' | 'medium' | 'long' | 'full' = 'medium',
  language: SupportedLanguages = 'en'
) => {
  const testDate = typeof date === 'string' ? new Date(date) : date;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    short: { dateStyle: 'short' as const },
    medium: { dateStyle: 'medium' as const },
    long: { dateStyle: 'long' as const },
    full: { dateStyle: 'full' as const }
  }[formatType];
  
  const locale = language === 'fr-CA' ? 'fr-CA' : 'en-CA';
  
  return {
    formatted: new Intl.DateTimeFormat(locale, formatOptions).format(testDate),
    locale,
    formatType
  };
};

/**
 * Helper to test number formatting in different locales
 */
export const testNumberFormatting = (
  number: number,
  options: Intl.NumberFormatOptions = {},
  language: SupportedLanguages = 'en'
) => {
  const locale = language === 'fr-CA' ? 'fr-CA' : 'en-CA';
  
  return {
    formatted: new Intl.NumberFormat(locale, options).format(number),
    locale,
    options
  };
};

/**
 * Helper to test currency formatting in different locales
 */
export const testCurrencyFormatting = (
  amount: number,
  currency: string = 'CAD',
  language: SupportedLanguages = 'en'
) => {
  return testNumberFormatting(amount, {
    style: 'currency',
    currency
  }, language);
};

/**
 * Helper to test percentage formatting in different locales
 */
export const testPercentageFormatting = (
  value: number,
  language: SupportedLanguages = 'en'
) => {
  return testNumberFormatting(value, {
    style: 'percent'
  }, language);
};

/**
 * Common test patterns for translation testing
 */
export const commonTestPatterns = {
  /**
   * Test that a component renders correctly in both languages
   */
  testBilingualRendering: async (
    renderComponent: (language: SupportedLanguages) => void,
    testKey: string,
    namespace: string = 'common'
  ) => {
    // Test English
    renderComponent('en');
    const englishText = getExpectedTranslation(testKey, 'en', namespace);
    const englishElement = screen.getByText(englishText);
    if (!englishElement) {
      throw new Error(`English text "${englishText}" not found`);
    }
    
    // Test French Canadian
    renderComponent('fr-CA');
    const frenchText = getExpectedTranslation(testKey, 'fr-CA', namespace);
    const frenchElement = screen.getByText(frenchText);
    if (!frenchElement) {
      throw new Error(`French text "${frenchText}" not found`);
    }
    
    return { englishText, frenchText };
  },
  
  /**
   * Test pluralization in both languages
   */
  testBilingualPluralization: (
    key: string,
    namespace: string = 'common'
  ) => {
    const englishPlural = testPluralization(key, 'en', namespace);
    const frenchPlural = testPluralization(key, 'fr-CA', namespace);
    
    return {
      english: englishPlural,
      french: frenchPlural
    };
  },
  
  /**
   * Test interpolation in both languages
   */
  testBilingualInterpolation: (
    key: string,
    replacements: Record<string, any>,
    namespace: string = 'common'
  ) => {
    const englishInterpolation = testInterpolation(key, replacements, 'en', namespace);
    const frenchInterpolation = testInterpolation(key, replacements, 'fr-CA', namespace);
    
    return {
      english: englishInterpolation,
      french: frenchInterpolation
    };
  }
};
