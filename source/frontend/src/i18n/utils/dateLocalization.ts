// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
  format, 
  formatDistance, 
  formatRelative, 
  parseISO, 
  isValid,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isTomorrow
} from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';

import { SupportedLanguages } from '../types';

/**
 * Date-fns locale mapping for supported languages
 */
const LOCALE_MAP = {
  'en': enCA, // Use Canadian English locale
  'fr-CA': frCA,
} as const;

/**
 * Get date-fns locale for the given language
 */
const getDateFnsLocale = (language: SupportedLanguages) => {
  return LOCALE_MAP[language] || LOCALE_MAP['en'];
};

/**
 * Common date format patterns for different locales
 */
const DATE_FORMATS = {
  'en': {
    short: 'MMM d, yyyy',
    medium: 'MMMM d, yyyy',
    long: 'EEEE, MMMM d, yyyy',
    time: 'h:mm a',
    dateTime: 'MMM d, yyyy h:mm a',
    dateTimeLong: 'EEEE, MMMM d, yyyy \'at\' h:mm a',
  },
  'fr-CA': {
    short: 'd MMM yyyy',
    medium: 'd MMMM yyyy',
    long: 'EEEE d MMMM yyyy',
    time: 'HH:mm',
    dateTime: 'd MMM yyyy HH:mm',
    dateTimeLong: 'EEEE d MMMM yyyy \'à\' HH:mm',
  },
} as const;

/**
 * Parse a date from various input formats
 */
const parseDate = (date: Date | string | number): Date | null => {
  try {
    if (date instanceof Date) {
      return isValid(date) ? date : null;
    }
    
    if (typeof date === 'string') {
      // Try parsing ISO string first
      const isoDate = parseISO(date);
      if (isValid(isoDate)) {
        return isoDate;
      }
      
      // Try parsing as regular date string
      const parsedDate = new Date(date);
      return isValid(parsedDate) ? parsedDate : null;
    }
    
    if (typeof date === 'number') {
      const numDate = new Date(date);
      return isValid(numDate) ? numDate : null;
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Format a date according to the specified locale and format
 */
export const formatDate = (
  date: Date | string | number,
  formatType: 'short' | 'medium' | 'long' | string = 'medium',
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    const formats = DATE_FORMATS[language];
    
    // Use predefined format or custom format string
    const formatString = (formats as any)[formatType] || formatType;
    
    return format(parsedDate, formatString, { locale });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date and time according to the specified locale
 */
export const formatDateTime = (
  date: Date | string | number,
  formatType: 'short' | 'medium' | 'long' = 'medium',
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    const formats = DATE_FORMATS[language];
    
    let formatString: string;
    switch (formatType) {
      case 'short':
        formatString = formats.dateTime;
        break;
      case 'long':
        formatString = formats.dateTimeLong;
        break;
      default:
        formatString = formats.dateTime;
    }
    
    return format(parsedDate, formatString, { locale });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only according to the specified locale
 */
export const formatTime = (
  date: Date | string | number,
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return 'Invalid Time';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    const formats = DATE_FORMATS[language];
    
    return format(parsedDate, formats.time, { locale });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (
  date: Date | string | number,
  baseDate: Date | string | number = new Date(),
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  const parsedBaseDate = parseDate(baseDate);
  
  if (!parsedDate || !parsedBaseDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    
    return formatDistance(parsedDate, parsedBaseDate, { 
      locale,
      addSuffix: true 
    });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format distance to now (e.g., "2 hours ago")
 */
export const formatDistanceToNowLocalized = (
  date: Date | string | number,
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    
    return formatDistanceToNow(parsedDate, { 
      locale,
      addSuffix: true 
    });
  } catch (error) {
    console.error('Distance to now formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format relative date (e.g., "today", "yesterday", "last Friday")
 */
export const formatRelativeDate = (
  date: Date | string | number,
  baseDate: Date | string | number = new Date(),
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  const parsedBaseDate = parseDate(baseDate);
  
  if (!parsedDate || !parsedBaseDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    
    // Check for special cases first
    if (isToday(parsedDate)) {
      return language === 'fr-CA' ? 'aujourd\'hui' : 'today';
    }
    
    if (isYesterday(parsedDate)) {
      return language === 'fr-CA' ? 'hier' : 'yesterday';
    }
    
    if (isTomorrow(parsedDate)) {
      return language === 'fr-CA' ? 'demain' : 'tomorrow';
    }
    
    // Use formatRelative for other cases
    return formatRelative(parsedDate, parsedBaseDate, { locale });
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date range (e.g., "Jan 1 - Jan 5, 2024")
 */
export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  language: SupportedLanguages = 'en'
): string => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);
  
  if (!parsedStartDate || !parsedEndDate) {
    return 'Invalid Date Range';
  }
  
  try {
    const locale = getDateFnsLocale(language);
    const formats = DATE_FORMATS[language];
    
    // Check if dates are in the same year
    const sameYear = parsedStartDate.getFullYear() === parsedEndDate.getFullYear();
    
    // Check if dates are in the same month
    const sameMonth = sameYear && parsedStartDate.getMonth() === parsedEndDate.getMonth();
    
    if (sameMonth) {
      // Same month: "Jan 1-5, 2024"
      const startDay = format(parsedStartDate, 'd', { locale });
      const endFormat = language === 'fr-CA' ? 'd MMM yyyy' : 'MMM d, yyyy';
      const endFormatted = format(parsedEndDate, endFormat, { locale });
      
      return language === 'fr-CA' 
        ? `${startDay}-${endFormatted}`
        : `${startDay}-${endFormatted}`;
    } else if (sameYear) {
      // Same year: "Jan 1 - Feb 5, 2024"
      const startFormat = language === 'fr-CA' ? 'd MMM' : 'MMM d';
      const endFormat = language === 'fr-CA' ? 'd MMM yyyy' : 'MMM d, yyyy';
      
      const startFormatted = format(parsedStartDate, startFormat, { locale });
      const endFormatted = format(parsedEndDate, endFormat, { locale });
      
      return `${startFormatted} - ${endFormatted}`;
    } else {
      // Different years: "Jan 1, 2023 - Feb 5, 2024"
      const startFormatted = format(parsedStartDate, formats.short, { locale });
      const endFormatted = format(parsedEndDate, formats.short, { locale });
      
      return `${startFormatted} - ${endFormatted}`;
    }
  } catch (error) {
    console.error('Date range formatting error:', error);
    return 'Invalid Date Range';
  }
};

/**
 * Get localized month names
 */
export const getMonthNames = (language: SupportedLanguages = 'en'): string[] => {
  const locale = getDateFnsLocale(language);
  const months: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1); // Use 2024 as a reference year
    months.push(format(date, 'MMMM', { locale }));
  }
  
  return months;
};

/**
 * Get localized day names
 */
export const getDayNames = (language: SupportedLanguages = 'en'): string[] => {
  const locale = getDateFnsLocale(language);
  const days: string[] = [];
  
  // Start from Sunday (0) to Saturday (6)
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i + 7); // January 7, 2024 is a Sunday
    days.push(format(date, 'EEEE', { locale }));
  }
  
  return days;
};

/**
 * Check if a date string is valid
 */
export const isValidDate = (date: Date | string | number): boolean => {
  const parsedDate = parseDate(date);
  return parsedDate !== null;
};

/**
 * Get timezone-aware date formatting
 */
export const formatDateWithTimezone = (
  date: Date | string | number,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: SupportedLanguages = 'en'
): string => {
  const parsedDate = parseDate(date);
  if (!parsedDate) {
    return 'Invalid Date';
  }
  
  try {
    const locale = language === 'fr-CA' ? 'fr-CA' : 'en-CA';
    
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  } catch (error) {
    console.error('Timezone date formatting error:', error);
    return formatDateTime(date, 'medium', language);
  }
};
