// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment';
import 'moment/locale/fr';

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
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Set moment locale when language changes
i18n.on('languageChanged', (lng) => {
  if (lng === 'fr-CA') {
    moment.locale('fr');
  } else {
    moment.locale('en');
  }
});

// Set initial moment locale
if (i18n.language === 'fr-CA') {
  moment.locale('fr');
} else {
  moment.locale('en');
}

export default i18n;
