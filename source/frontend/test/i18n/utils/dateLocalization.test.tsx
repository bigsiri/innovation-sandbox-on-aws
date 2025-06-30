// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatDistanceToNowLocalized,
  formatRelativeDate,
  formatDateRange,
  getMonthNames,
  getDayNames,
  isValidDate,
  formatDateWithTimezone,
} from '@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization';

// Mock console to avoid noise in tests
const mockConsole = {
  error: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('Date Localization Utils', () => {
  const testDate = new Date('2024-03-15T14:30:00Z');
  const testDateString = '2024-03-15T14:30:00Z';
  const testTimestamp = testDate.getTime();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatDate', () => {
    it('should format date in English', () => {
      const result = formatDate(testDate, 'medium', 'en');
      expect(result).toMatch(/March 15, 2024/);
    });

    it('should format date in French Canadian', () => {
      const result = formatDate(testDate, 'medium', 'fr-CA');
      expect(result).toMatch(/15 mars 2024/);
    });

    it('should handle different format types', () => {
      const shortEn = formatDate(testDate, 'short', 'en');
      const longEn = formatDate(testDate, 'long', 'en');
      
      expect(shortEn).toMatch(/Mar 15, 2024/);
      expect(longEn).toMatch(/Friday, March 15, 2024/);
    });

    it('should handle custom format strings', () => {
      const result = formatDate(testDate, 'yyyy-MM-dd', 'en');
      expect(result).toBe('2024-03-15');
    });

    it('should handle string input', () => {
      const result = formatDate(testDateString, 'medium', 'en');
      expect(result).toMatch(/March 15, 2024/);
    });

    it('should handle timestamp input', () => {
      const result = formatDate(testTimestamp, 'medium', 'en');
      expect(result).toMatch(/March 15, 2024/);
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date', 'medium', 'en');
      expect(result).toBe('Invalid Date');
    });

    it('should handle formatting errors gracefully', () => {
      const result = formatDate(testDate, 'invalid-format-with-special-chars-###', 'en');
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime in English', () => {
      const result = formatDateTime(testDate, 'medium', 'en');
      expect(result).toMatch(/Mar 15, 2024.*2:30 PM|14:30/);
    });

    it('should format datetime in French Canadian', () => {
      const result = formatDateTime(testDate, 'medium', 'fr-CA');
      expect(result).toMatch(/15 mars 2024.*14:30/);
    });

    it('should handle different format types', () => {
      const short = formatDateTime(testDate, 'short', 'en');
      const long = formatDateTime(testDate, 'long', 'en');
      
      expect(short).toContain('Mar 15, 2024');
      expect(long).toContain('Friday, March 15, 2024');
    });

    it('should handle invalid dates', () => {
      const result = formatDateTime('invalid', 'medium', 'en');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatTime', () => {
    it('should format time in English (12-hour)', () => {
      const result = formatTime(testDate, 'en');
      expect(result).toMatch(/2:30 PM|14:30/);
    });

    it('should format time in French Canadian (24-hour)', () => {
      const result = formatTime(testDate, 'fr-CA');
      expect(result).toBe('14:30');
    });

    it('should handle invalid dates', () => {
      const result = formatTime('invalid', 'en');
      expect(result).toBe('Invalid Time');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time in English', () => {
      const baseDate = new Date('2024-03-15T12:30:00Z');
      const result = formatRelativeTime(testDate, baseDate, 'en');
      expect(result).toMatch(/2 hours/);
    });

    it('should format relative time in French Canadian', () => {
      const baseDate = new Date('2024-03-15T12:30:00Z');
      const result = formatRelativeTime(testDate, baseDate, 'fr-CA');
      expect(result).toMatch(/2 heures/);
    });

    it('should handle past dates', () => {
      const futureDate = new Date('2024-03-15T16:30:00Z');
      const result = formatRelativeTime(testDate, futureDate, 'en');
      expect(result).toMatch(/2 hours ago/);
    });

    it('should handle invalid dates', () => {
      const result = formatRelativeTime('invalid', testDate, 'en');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDistanceToNowLocalized', () => {
    it('should format distance to now', () => {
      // Mock current time
      const mockNow = new Date('2024-03-15T16:30:00Z');
      vi.setSystemTime(mockNow);

      const result = formatDistanceToNowLocalized(testDate, 'en');
      expect(result).toMatch(/2 hours ago/);

      vi.useRealTimers();
    });

    it('should handle invalid dates', () => {
      const result = formatDistanceToNowLocalized('invalid', 'en');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "today" for today\'s date', () => {
      const today = new Date();
      const result = formatRelativeDate(today, today, 'en');
      expect(result).toBe('today');
    });

    it('should return "aujourd\'hui" for today in French', () => {
      const today = new Date();
      const result = formatRelativeDate(today, today, 'fr-CA');
      expect(result).toBe('aujourd\'hui');
    });

    it('should return "yesterday" for yesterday\'s date', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = formatRelativeDate(yesterday, today, 'en');
      expect(result).toBe('yesterday');
    });

    it('should return "hier" for yesterday in French', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = formatRelativeDate(yesterday, today, 'fr-CA');
      expect(result).toBe('hier');
    });

    it('should handle invalid dates', () => {
      const result = formatRelativeDate('invalid', new Date(), 'en');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateRange', () => {
    it('should format same month range', () => {
      const startDate = new Date('2024-03-15');
      const endDate = new Date('2024-03-20');
      
      const result = formatDateRange(startDate, endDate, 'en');
      expect(result).toMatch(/15-.*Mar 20, 2024/);
    });

    it('should format same year range', () => {
      const startDate = new Date('2024-03-15');
      const endDate = new Date('2024-05-20');
      
      const result = formatDateRange(startDate, endDate, 'en');
      expect(result).toMatch(/Mar 15.*May 20, 2024/);
    });

    it('should format different year range', () => {
      const startDate = new Date('2023-12-15');
      const endDate = new Date('2024-01-20');
      
      const result = formatDateRange(startDate, endDate, 'en');
      expect(result).toMatch(/Dec 15, 2023.*Jan 20, 2024/);
    });

    it('should handle invalid dates', () => {
      const result = formatDateRange('invalid', testDate, 'en');
      expect(result).toBe('Invalid Date Range');
    });
  });

  describe('getMonthNames', () => {
    it('should return English month names', () => {
      const months = getMonthNames('en');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('January');
      expect(months[11]).toBe('December');
    });

    it('should return French Canadian month names', () => {
      const months = getMonthNames('fr-CA');
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('janvier');
      expect(months[11]).toBe('décembre');
    });
  });

  describe('getDayNames', () => {
    it('should return English day names', () => {
      const days = getDayNames('en');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Sunday');
      expect(days[6]).toBe('Saturday');
    });

    it('should return French Canadian day names', () => {
      const days = getDayNames('fr-CA');
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('dimanche');
      expect(days[6]).toBe('samedi');
    });
  });

  describe('isValidDate', () => {
    it('should validate valid dates', () => {
      expect(isValidDate(testDate)).toBe(true);
      expect(isValidDate(testDateString)).toBe(true);
      expect(isValidDate(testTimestamp)).toBe(true);
    });

    it('should invalidate invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate(NaN)).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });
  });

  describe('formatDateWithTimezone', () => {
    it('should format date with timezone', () => {
      const result = formatDateWithTimezone(testDate, 'America/Toronto', 'en');
      expect(result).toMatch(/March 15, 2024/);
    });

    it('should handle invalid timezone gracefully', () => {
      const result = formatDateWithTimezone(testDate, 'Invalid/Timezone', 'en');
      // Should fallback to regular formatting
      expect(result).toMatch(/Mar 15, 2024/);
    });

    it('should handle invalid dates', () => {
      const result = formatDateWithTimezone('invalid', 'America/Toronto', 'en');
      expect(result).toBe('Invalid Date');
    });
  });
});
