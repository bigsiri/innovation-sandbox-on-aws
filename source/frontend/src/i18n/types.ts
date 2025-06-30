// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Supported languages in the application
 */
export type SupportedLanguages = 'en' | 'fr-CA';

/**
 * Available translation namespaces
 */
export type TranslationNamespaces = 
  | 'common'
  | 'navigation'
  | 'forms'
  | 'users'
  | 'approvals'
  | 'leases'
  | 'leaseTemplates'
  | 'accounts'
  | 'settings'
  | 'home'
  | 'errors';

/**
 * Language information interface
 */
export interface LanguageInfo {
  code: SupportedLanguages;
  name: string;
  nativeName: string;
  flag?: string;
}

/**
 * Translation resource structure for common namespace
 */
export interface CommonTranslations {
  loading: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  retry: string;
  refresh: string;
  submit: string;
  reset: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  confirm: string;
  yes: string;
  no: string;
  ok: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  required: string;
  optional: string;
  search: string;
  filter: string;
  sort: string;
  actions: string;
  status: string;
  name: string;
  description: string;
  date: string;
  time: string;
  email: string;
  password: string;
  username: string;
}

/**
 * Translation resource structure for navigation namespace
 */
export interface NavigationTranslations {
  home: string;
  leases: string;
  accounts: string;
  settings: string;
  users: string;
  dashboard: string;
  profile: string;
  logout: string;
}

/**
 * Translation resource structure for forms namespace
 */
export interface FormsTranslations {
  labels: {
    required: string;
    optional: string;
    [key: string]: string;
  };
  actions: {
    save: string;
    cancel: string;
    submit: string;
    reset: string;
    [key: string]: string;
  };
  validation: {
    required: string;
    invalidEmail: string;
    invalidFormat: string;
    minLength: string;
    maxLength: string;
    [key: string]: string;
  };
}

/**
 * Translation resource structure for users namespace
 */
export interface UsersTranslations {
  addUserForm: {
    title: string;
    emailField: {
      label: string;
      description: string;
      placeholder: string;
    };
    requirements: {
      title: string;
      idcUser: string;
      groupAssignment: string;
      permissions: string;
    };
    actions: {
      submit: string;
      cancel: string;
    };
  };
  userList: {
    headers: {
      email: string;
      name: string;
      status: string;
      actions: string;
    };
    actions: {
      remove: string;
      retry: string;
    };
    status: {
      active: string;
      pending: string;
      failed: string;
    };
  };
}

/**
 * Complete translation resources interface
 */
export interface TranslationResources {
  common: CommonTranslations;
  navigation: NavigationTranslations;
  forms: FormsTranslations;
  users: UsersTranslations;
  [key: string]: any; // Allow for additional namespaces
}

/**
 * i18n configuration options interface
 */
export interface I18nConfig {
  defaultLanguage: SupportedLanguages;
  supportedLanguages: SupportedLanguages[];
  defaultNamespace: TranslationNamespaces;
  namespaces: TranslationNamespaces[];
  debug?: boolean;
}

/**
 * Language detection result interface
 */
export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguages;
  source: 'localStorage' | 'navigator' | 'htmlTag' | 'default';
  confidence: number;
}

/**
 * Translation loading state interface
 */
export interface TranslationLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  language: SupportedLanguages;
  namespace: TranslationNamespaces;
}

/**
 * Translation function type with proper typing
 */
export type TranslationFunction = (
  key: string,
  options?: {
    defaultValue?: string;
    count?: number;
    context?: string;
    replace?: Record<string, any>;
    lng?: SupportedLanguages;
    ns?: TranslationNamespaces;
  }
) => string;

/**
 * Custom hook return type for useTranslation
 */
export interface UseTranslationReturn {
  t: TranslationFunction;
  i18n: any;
  ready: boolean;
  currentLanguage: SupportedLanguages;
  changeLanguage: (language: SupportedLanguages) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Language switcher component props
 */
export interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'toggle' | 'tabs';
  showFlags?: boolean;
  showNativeNames?: boolean;
  disabled?: boolean;
  onLanguageChange?: (language: SupportedLanguages) => void;
}

/**
 * Translation validation result interface
 */
export interface TranslationValidationResult {
  isValid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  namespace: TranslationNamespaces;
  language: SupportedLanguages;
}

/**
 * Available languages configuration
 */
export const AVAILABLE_LANGUAGES: Record<SupportedLanguages, LanguageInfo> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  'fr-CA': {
    code: 'fr-CA',
    name: 'French (Canada)',
    nativeName: 'Français (Canada)',
    flag: '🇨🇦'
  }
};

/**
 * Default translation namespaces in order of priority
 */
export const NAMESPACE_PRIORITY: TranslationNamespaces[] = [
  'common',
  'navigation',
  'forms',
  'users',
  'leases',
  'accounts',
  'settings',
  'home',
  'errors'
];

// Type augmentation for react-i18next
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: CommonTranslations;
      navigation: NavigationTranslations;
      forms: FormsTranslations;
      users: UsersTranslations;
    };
  }
}
