// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SupportedLanguages } from '../types';
import { DEFAULT_LANGUAGE } from '../index';

/**
 * Key used for storing language preference in localStorage
 */
export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (language: SupportedLanguages): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    
    // Also update the HTML lang attribute for accessibility
    document.documentElement.lang = language;
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language } 
    }));
    
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
};

/**
 * Load language preference from localStorage
 */
export const loadLanguagePreference = (): SupportedLanguages => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguages;
    
    // Validate that the saved language is supported
    if (saved && ['en', 'fr-CA'].includes(saved)) {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to load language preference:', error);
  }
  
  return DEFAULT_LANGUAGE;
};

/**
 * Detect browser language and convert to supported language
 */
export const detectBrowserLanguage = (): SupportedLanguages => {
  try {
    const browserLang = navigator.language || navigator.languages?.[0];
    
    if (!browserLang) {
      return DEFAULT_LANGUAGE;
    }
    
    // Convert common language codes
    if (browserLang.startsWith('fr')) {
      return 'fr-CA';
    }
    
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Get the best language to use based on saved preference, browser detection, and fallback
 */
export const getBestLanguage = (): SupportedLanguages => {
  // First try saved preference
  const saved = loadLanguagePreference();
  if (saved !== DEFAULT_LANGUAGE) {
    return saved;
  }
  
  // Then try browser detection
  const detected = detectBrowserLanguage();
  if (detected !== DEFAULT_LANGUAGE) {
    return detected;
  }
  
  // Finally fallback to default
  return DEFAULT_LANGUAGE;
};

/**
 * Clear language preference (useful for testing or reset functionality)
 */
export const clearLanguagePreference = (): void => {
  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    document.documentElement.lang = DEFAULT_LANGUAGE;
  } catch (error) {
    console.warn('Failed to clear language preference:', error);
  }
};
