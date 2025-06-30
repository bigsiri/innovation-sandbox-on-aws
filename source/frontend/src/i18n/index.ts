// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import { SupportedLanguages, TranslationNamespaces } from './types';

// Configuration constants
const DEFAULT_LANGUAGE: SupportedLanguages = 'en';
const SUPPORTED_LANGUAGES: SupportedLanguages[] = ['en', 'fr-CA'];
const DEFAULT_NAMESPACE: TranslationNamespaces = 'common';
const NAMESPACES: TranslationNamespaces[] = ['common', 'navigation', 'forms', 'users', 'leases', 'accounts', 'settings', 'home', 'leaseTemplates'];

// Initialize i18next with minimal configuration
const initializeI18n = async (): Promise<typeof i18n> => {
  try {
    await i18n
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        defaultNS: DEFAULT_NAMESPACE,
        ns: NAMESPACES,
        
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
          lookupLocalStorage: 'i18nextLng',
        },
        
        interpolation: {
          escapeValue: false,
        },
        
        react: {
          useSuspense: false,
        },
        
        debug: false,
      });

    return i18n;
  } catch (error) {
    console.error('i18n - Failed to initialize:', error);
    
    // Fallback to basic configuration
    await i18n.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          common: { loading: 'Loading...', error: 'Error' },
          leaseTemplates: { 
            page: { 
              errorLoadingTemplate: 'Error loading template',
              errorLoadingConfig: 'Error loading config',
              updateNotice: { title: 'Please Note', description: 'Changes will only affect new leases' }
            },
            tabs: { basicDetails: 'Basic Details', budget: 'Budget', duration: 'Duration' }
          }
        }
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false }
    });
    
    return i18n;
  }
};

// Export the configured i18n instance
export default i18n;
export { initializeI18n };
export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, DEFAULT_NAMESPACE, NAMESPACES };
