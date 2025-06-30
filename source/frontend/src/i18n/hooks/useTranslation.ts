// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';

import { 
  SupportedLanguages, 
  TranslationNamespaces, 
  UseTranslationReturn,
  TranslationFunction 
} from '../types';
import { DEFAULT_LANGUAGE } from '../index';

/**
 * Enhanced useTranslation hook that wraps react-i18next's useTranslation
 * with additional functionality and better TypeScript support
 */
export const useTranslation = (
  namespace?: TranslationNamespaces | TranslationNamespaces[]
): UseTranslationReturn => {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  // Get current language with type safety
  const currentLanguage = useMemo((): SupportedLanguages => {
    const lang = i18n.language as SupportedLanguages;
    return ['en', 'fr-CA'].includes(lang) ? lang : DEFAULT_LANGUAGE;
  }, [i18n.language]);

  // Enhanced translation function with error handling
  const enhancedT: TranslationFunction = useCallback((
    key: string,
    options?: {
      defaultValue?: string;
      count?: number;
      context?: string;
      replace?: Record<string, any>;
      lng?: SupportedLanguages;
      ns?: TranslationNamespaces;
    }
  ) => {
    try {
      // Check if key exists before translation
      const keyExists = i18n.exists(key, options);
      
      if (!keyExists && process.env.NODE_ENV === 'development') {
        console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
      }

      // Perform translation with error handling
      const result = t(key, {
        ...options,
        // Provide fallback if no defaultValue is specified
        defaultValue: options?.defaultValue || key,
      });

      // Return the translation result
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return options?.defaultValue || key;
    }
  }, [t, i18n, currentLanguage]);

  // Enhanced language change function with error handling
  const changeLanguage = useCallback(async (language: SupportedLanguages): Promise<void> => {
    try {
      await i18n.changeLanguage(language);
      
      // Explicitly save to localStorage to ensure persistence
      localStorage.setItem('i18nextLng', language);
      
    } catch (error) {
      console.error(`Failed to change language to ${language}:`, error);
      
      // Attempt fallback to default language
      if (language !== DEFAULT_LANGUAGE) {
        try {
          await i18n.changeLanguage(DEFAULT_LANGUAGE);
          localStorage.setItem('i18nextLng', DEFAULT_LANGUAGE);
          console.warn(`Fell back to default language: ${DEFAULT_LANGUAGE}`);
        } catch (fallbackError) {
          console.error('Failed to fallback to default language:', fallbackError);
        }
      }
      
      throw error;
    }
  }, [i18n]);

  // Check if translations are currently loading
  const isLoading = useMemo(() => {
    return !ready || i18n.isInitialized === false;
  }, [ready, i18n.isInitialized]);

  // Get any initialization errors
  const error = useMemo(() => {
    // Check if i18n failed to initialize
    if (i18n.isInitialized === false && ready === false) {
      return new Error('i18n failed to initialize');
    }
    return null;
  }, [i18n.isInitialized, ready]);

  return {
    t: enhancedT,
    i18n,
    ready,
    currentLanguage,
    changeLanguage,
    isLoading,
    error,
  };
};

/**
 * Hook for getting translation function without component re-renders
 * Useful for translations in event handlers or effects
 */
export const useTranslationStatic = (
  namespace?: TranslationNamespaces | TranslationNamespaces[]
) => {
  const { i18n } = useI18nTranslation(namespace);
  
  return useCallback((
    key: string,
    options?: {
      defaultValue?: string;
      count?: number;
      context?: string;
      replace?: Record<string, any>;
      lng?: SupportedLanguages;
      ns?: TranslationNamespaces;
    }
  ) => {
    try {
      return i18n.t(key, {
        ...options,
        defaultValue: options?.defaultValue || key,
      });
    } catch (error) {
      console.error(`Static translation error for key "${key}":`, error);
      return options?.defaultValue || key;
    }
  }, [i18n]);
};

/**
 * Hook for checking if a translation key exists
 */
export const useTranslationExists = (
  namespace?: TranslationNamespaces | TranslationNamespaces[]
) => {
  const { i18n } = useI18nTranslation(namespace);
  
  return useCallback((
    key: string,
    options?: {
      lng?: SupportedLanguages;
      ns?: TranslationNamespaces;
    }
  ) => {
    try {
      return i18n.exists(key, options);
    } catch (error) {
      console.error(`Error checking translation key existence "${key}":`, error);
      return false;
    }
  }, [i18n]);
};

/**
 * Hook for getting multiple translations at once
 */
export const useTranslations = (
  keys: string[],
  namespace?: TranslationNamespaces | TranslationNamespaces[]
) => {
  const { t } = useTranslation(namespace);
  
  return useMemo(() => {
    const translations: Record<string, string> = {};
    
    keys.forEach(key => {
      translations[key] = t(key);
    });
    
    return translations;
  }, [keys, t]);
};

/**
 * Hook for getting current language information
 */
export const useLanguageInfo = () => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslation();
  
  const languageInfo = useMemo(() => {
    const languages = {
      'en': {
        code: 'en' as const,
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
      },
      'fr-CA': {
        code: 'fr-CA' as const,
        name: 'French (Canada)',
        nativeName: 'Français (Canada)',
        flag: '🇨🇦',
      },
    };
    
    return {
      current: languages[currentLanguage],
      available: Object.values(languages),
      isRTL: false, // Neither English nor French Canadian are RTL
    };
  }, [currentLanguage]);
  
  return {
    ...languageInfo,
    changeLanguage,
    isLoading,
  };
};
