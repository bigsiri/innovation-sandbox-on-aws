// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
  formatDistanceToNow,
  isValid,
  parseISO
} from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';

import { SupportedLanguages } from '../types';

/**
 * Date-fns locale mapping for supported languages
 */
const LOCALE_MAP = {
  'en': enCA,
  'fr-CA': frCA,
} as const;

/**
 * Get date-fns locale for the given language
 */
const getDateFnsLocale = (language: SupportedLanguages) => {
  return LOCALE_MAP[language] || LOCALE_MAP['en'];
};

/**
 * Parse a date from various input formats
 */
const parseDate = (date: Date | string | number): Date | null => {
  try {
    if (date instanceof Date) {
      return isValid(date) ? date : null;
    }
    
    if (typeof date === 'string') {
      const isoDate = parseISO(date);
      if (isValid(isoDate)) {
        return isoDate;
      }
      
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
