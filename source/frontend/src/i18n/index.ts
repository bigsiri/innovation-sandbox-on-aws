// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { getLanguageConfig, getSupportedLanguages } from '@amzn/innovation-sandbox-frontend/helpers/languageConfig';

// Import translation files
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enLeases from './locales/en/leases.json';
import enApprovals from './locales/en/approvals.json';
import enLeaseTemplates from './locales/en/leaseTemplates.json';
import enAccounts from './locales/en/accounts.json';
import enSettings from './locales/en/settings.json';
import frCACommon from './locales/fr-CA/common.json';
import frCAHome from './locales/fr-CA/home.json';
import frCALeases from './locales/fr-CA/leases.json';
import frCAApprovals from './locales/fr-CA/approvals.json';
import frCALeaseTemplates from './locales/fr-CA/leaseTemplates.json';
import frCAAccounts from './locales/fr-CA/accounts.json';
import frCASettings from './locales/fr-CA/settings.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    leases: enLeases,
    approvals: enApprovals,
    leaseTemplates: enLeaseTemplates,
    accounts: enAccounts,
    settings: enSettings,
  },
  'fr-CA': {
    common: frCACommon,
    home: frCAHome,
    leases: frCALeases,
    approvals: frCAApprovals,
    leaseTemplates: frCALeaseTemplates,
    accounts: frCAAccounts,
    settings: frCASettings,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default fallback
    fallbackLng: 'en',
    supportedLngs: getSupportedLanguages(),
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Load AppConfig language settings and update i18n
getLanguageConfig().then((config) => {
  // Update detection order based on AppConfig settings
  const detectionOrder = config.enableBrowserDetection 
    ? ['localStorage', 'navigator', 'htmlTag'] 
    : ['localStorage'];
  
  // Update i18n options
  i18n.options.detection = {
    ...i18n.options.detection,
    order: detectionOrder,
  };
  
  // Set default language from AppConfig if no user preference exists
  const currentLang = localStorage.getItem('i18nextLng');
  if (!currentLang) {
    i18n.changeLanguage(config.defaultLanguage);
  }
}).catch((error) => {
  console.warn('Failed to apply AppConfig language settings:', error);
});

export default i18n;
