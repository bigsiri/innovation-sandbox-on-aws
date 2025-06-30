// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SupportedLanguages } from '../../i18n/types';

/**
 * Language option for the language switcher dropdown
 */
export interface LanguageOption {
  /** Language code (e.g., 'en', 'fr-CA') */
  value: SupportedLanguages;
  /** Display label for the language option */
  label: string;
  /** Localized display label */
  displayLabel?: string;
  /** Native name of the language */
  nativeName: string;
  /** Flag emoji or icon for the language */
  flag: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Props for the LanguageSwitcher component
 */
export interface LanguageSwitcherProps {
  /** Custom CSS class name */
  className?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to show the component in a compact form (icon only) */
  compact?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Callback fired when language changes */
  onLanguageChange?: (language: SupportedLanguages) => void;
  /** Whether to show loading state */
  loading?: boolean;
  /** Custom test ID for testing */
  testId?: string;
  /** Whether to show confirmation message after language change */
  showConfirmation?: boolean;
}

/**
 * Event handler type for language change events
 */
export type LanguageChangeHandler = (language: SupportedLanguages) => void | Promise<void>;

/**
 * Language switcher state interface
 */
export interface LanguageSwitcherState {
  /** Currently selected language */
  selectedLanguage: SupportedLanguages;
  /** Whether language switching is in progress */
  isLoading: boolean;
  /** Any error that occurred during language switching */
  error: Error | null;
  /** Available language options */
  availableLanguages: LanguageOption[];
}

/**
 * Local storage key for persisting language preference
 * Must match the key used by i18next language detector
 */
export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

/**
 * Default language options configuration
 */
export const DEFAULT_LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: 'en',
    label: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    value: 'fr-CA',
    label: 'French (Canada)',
    nativeName: 'Français (Canada)',
    flag: '🇨🇦',
  },
];
