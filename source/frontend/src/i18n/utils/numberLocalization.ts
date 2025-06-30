// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SupportedLanguages } from '../types';

/**
 * Locale mapping for Intl API
 */
const INTL_LOCALE_MAP = {
  'en': 'en-CA', // Canadian English
  'fr-CA': 'fr-CA', // French Canadian
} as const;

/**
 * Get Intl locale for the given language
 */
const getIntlLocale = (language: SupportedLanguages): string => {
  return INTL_LOCALE_MAP[language] || INTL_LOCALE_MAP['en'];
};

/**
 * Parse a number from various input formats
 */
const parseNumber = (value: number | string): number | null => {
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? null : value;
  }
  
  if (typeof value === 'string') {
    // Remove common formatting characters and parse
    const cleanValue = value.replace(/[\s,]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  }
  
  return null;
};

/**
 * Format a number according to the specified locale
 */
export const formatNumber = (
  value: number | string,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    minimumIntegerDigits?: number;
    useGrouping?: boolean;
    style?: 'decimal' | 'percent';
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedValue = parseNumber(value);
  if (parsedValue === null) {
    return 'Invalid Number';
  }
  
  try {
    const locale = getIntlLocale(language);
    
    const formatter = new Intl.NumberFormat(locale, {
      style: options.style || 'decimal',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      minimumIntegerDigits: options.minimumIntegerDigits,
      useGrouping: options.useGrouping !== false, // Default to true
    });
    
    return formatter.format(parsedValue);
  } catch (error) {
    console.error('Number formatting error:', error);
    return String(parsedValue);
  }
};

/**
 * Format a currency amount according to the specified locale
 */
export const formatCurrency = (
  value: number | string,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedValue = parseNumber(value);
  if (parsedValue === null) {
    return 'Invalid Amount';
  }
  
  try {
    const locale = getIntlLocale(language);
    const currency = options.currency || 'CAD'; // Default to Canadian Dollar
    
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: options.currencyDisplay || 'symbol',
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    });
    
    return formatter.format(parsedValue);
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback to basic formatting
    return `$${formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }, language)}`;
  }
};

/**
 * Format a percentage according to the specified locale
 */
export const formatPercentage = (
  value: number | string,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    multiplier?: number; // If value is already in percentage form (0-100), use 1. If decimal (0-1), use 100
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedValue = parseNumber(value);
  if (parsedValue === null) {
    return 'Invalid Percentage';
  }
  
  try {
    const locale = getIntlLocale(language);
    const multiplier = options.multiplier ?? 1; // Default assumes value is already in percentage form
    const adjustedValue = parsedValue / multiplier;
    
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: options.minimumFractionDigits ?? 1,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    });
    
    return formatter.format(adjustedValue);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    // Fallback to basic formatting
    return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 2 }, language)}%`;
  }
};

/**
 * Format a decimal as percentage (0.25 -> 25%)
 */
export const formatDecimalAsPercentage = (
  value: number | string,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  return formatPercentage(value, {
    ...options,
    multiplier: 100, // Convert decimal to percentage
  }, language);
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (
  bytes: number | string,
  options: {
    binary?: boolean; // Use binary (1024) or decimal (1000) units
    maximumFractionDigits?: number;
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedBytes = parseNumber(bytes);
  if (parsedBytes === null || parsedBytes < 0) {
    return 'Invalid Size';
  }
  
  const binary = options.binary !== false; // Default to binary
  const base = binary ? 1024 : 1000;
  const units = binary 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  if (parsedBytes === 0) {
    return `0 ${units[0]}`;
  }
  
  const unitIndex = Math.floor(Math.log(parsedBytes) / Math.log(base));
  const clampedIndex = Math.min(unitIndex, units.length - 1);
  const value = parsedBytes / Math.pow(base, clampedIndex);
  
  const formattedValue = formatNumber(value, {
    maximumFractionDigits: options.maximumFractionDigits ?? (clampedIndex === 0 ? 0 : 1),
  }, language);
  
  return `${formattedValue} ${units[clampedIndex]}`;
};

/**
 * Format a large number with compact notation (1.2K, 1.5M, etc.)
 */
export const formatCompactNumber = (
  value: number | string,
  options: {
    notation?: 'compact' | 'scientific' | 'engineering';
    compactDisplay?: 'short' | 'long';
    maximumFractionDigits?: number;
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedValue = parseNumber(value);
  if (parsedValue === null) {
    return 'Invalid Number';
  }
  
  try {
    const locale = getIntlLocale(language);
    
    const formatter = new Intl.NumberFormat(locale, {
      notation: options.notation || 'compact',
      compactDisplay: options.compactDisplay || 'short',
      maximumFractionDigits: options.maximumFractionDigits ?? 1,
    });
    
    return formatter.format(parsedValue);
  } catch (error) {
    console.error('Compact number formatting error:', error);
    // Fallback to regular number formatting
    return formatNumber(value, { maximumFractionDigits: 0 }, language);
  }
};

/**
 * Format duration in seconds to human readable format
 */
export const formatDuration = (
  seconds: number | string,
  options: {
    format?: 'short' | 'long'; // "1h 30m" vs "1 hour 30 minutes"
    maxUnits?: number; // Maximum number of units to show
  } = {},
  language: SupportedLanguages = 'en'
): string => {
  const parsedSeconds = parseNumber(seconds);
  if (parsedSeconds === null || parsedSeconds < 0) {
    return 'Invalid Duration';
  }
  
  const format = options.format || 'short';
  const maxUnits = options.maxUnits || 2;
  
  const units = [
    { value: 31536000, short: { en: 'y', 'fr-CA': 'a' }, long: { en: 'year', 'fr-CA': 'année' } },
    { value: 2592000, short: { en: 'mo', 'fr-CA': 'mo' }, long: { en: 'month', 'fr-CA': 'mois' } },
    { value: 604800, short: { en: 'w', 'fr-CA': 's' }, long: { en: 'week', 'fr-CA': 'semaine' } },
    { value: 86400, short: { en: 'd', 'fr-CA': 'j' }, long: { en: 'day', 'fr-CA': 'jour' } },
    { value: 3600, short: { en: 'h', 'fr-CA': 'h' }, long: { en: 'hour', 'fr-CA': 'heure' } },
    { value: 60, short: { en: 'm', 'fr-CA': 'm' }, long: { en: 'minute', 'fr-CA': 'minute' } },
    { value: 1, short: { en: 's', 'fr-CA': 's' }, long: { en: 'second', 'fr-CA': 'seconde' } },
  ];
  
  const parts: string[] = [];
  let remainingSeconds = Math.floor(parsedSeconds);
  
  for (const unit of units) {
    if (parts.length >= maxUnits) break;
    
    const count = Math.floor(remainingSeconds / unit.value);
    if (count > 0) {
      remainingSeconds -= count * unit.value;
      
      if (format === 'short') {
        parts.push(`${count}${unit.short[language]}`);
      } else {
        const unitName = unit.long[language];
        const pluralUnit = language === 'fr-CA' && count > 1 
          ? (unitName === 'mois' ? 'mois' : unitName + 's')
          : (count > 1 ? unitName + 's' : unitName);
        parts.push(`${count} ${pluralUnit}`);
      }
    }
  }
  
  if (parts.length === 0) {
    const zeroUnit = format === 'short' 
      ? `0${units[units.length - 1].short[language]}`
      : `0 ${units[units.length - 1].long[language]}`;
    return zeroUnit;
  }
  
  return parts.join(' ');
};

/**
 * Parse a localized number string back to a number
 */
export const parseLocalizedNumber = (
  value: string,
  language: SupportedLanguages = 'en'
): number | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  try {
    // Remove common formatting based on locale
    let cleanValue = value.trim();
    
    if (language === 'fr-CA') {
      // French Canadian uses space as thousands separator and comma as decimal
      cleanValue = cleanValue.replace(/\s/g, '').replace(',', '.');
    } else {
      // English Canadian uses comma as thousands separator and period as decimal
      cleanValue = cleanValue.replace(/,/g, '');
    }
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  } catch (error) {
    console.error('Localized number parsing error:', error);
    return null;
  }
};

/**
 * Get the decimal separator for the given locale
 */
export const getDecimalSeparator = (language: SupportedLanguages = 'en'): string => {
  try {
    const locale = getIntlLocale(language);
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1.1);
    const decimalPart = parts.find(part => part.type === 'decimal');
    return decimalPart?.value || '.';
  } catch (error) {
    console.error('Error getting decimal separator:', error);
    return '.';
  }
};

/**
 * Get the thousands separator for the given locale
 */
export const getThousandsSeparator = (language: SupportedLanguages = 'en'): string => {
  try {
    const locale = getIntlLocale(language);
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1000);
    const groupPart = parts.find(part => part.type === 'group');
    return groupPart?.value || ',';
  } catch (error) {
    console.error('Error getting thousands separator:', error);
    return ',';
  }
};
