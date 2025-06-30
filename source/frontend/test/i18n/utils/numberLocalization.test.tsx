// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDecimalAsPercentage,
  formatFileSize,
  formatCompactNumber,
  formatDuration,
  parseLocalizedNumber,
  getDecimalSeparator,
  getThousandsSeparator,
} from '@amzn/innovation-sandbox-frontend/i18n/utils/numberLocalization';

// Mock console to avoid noise in tests
const mockConsole = {
  error: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('Number Localization Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatNumber', () => {
    it('should format numbers in English Canadian locale', () => {
      const result = formatNumber(1234.56, {}, 'en');
      expect(result).toBe('1,234.56');
    });

    it('should format numbers in French Canadian locale', () => {
      const result = formatNumber(1234.56, {}, 'fr-CA');
      expect(result).toBe('1 234,56');
    });

    it('should handle string input', () => {
      const result = formatNumber('1234.56', {}, 'en');
      expect(result).toBe('1,234.56');
    });

    it('should handle formatting options', () => {
      const result = formatNumber(1234.5, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }, 'en');
      expect(result).toBe('1,234.50');
    });

    it('should handle grouping options', () => {
      const result = formatNumber(1234.56, { useGrouping: false }, 'en');
      expect(result).toBe('1234.56');
    });

    it('should handle invalid numbers', () => {
      const result = formatNumber('invalid', {}, 'en');
      expect(result).toBe('Invalid Number');
    });

    it('should handle NaN and Infinity', () => {
      expect(formatNumber(NaN, {}, 'en')).toBe('Invalid Number');
      expect(formatNumber(Infinity, {}, 'en')).toBe('Invalid Number');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in English Canadian', () => {
      const result = formatCurrency(1234.56, {}, 'en');
      expect(result).toMatch(/\$1,234\.56|\$1 234,56/);
    });

    it('should format currency in French Canadian', () => {
      const result = formatCurrency(1234.56, {}, 'fr-CA');
      expect(result).toMatch(/1 234,56.*\$|1 234,56.*CAD/);
    });

    it('should handle different currencies', () => {
      const result = formatCurrency(1234.56, { currency: 'USD' }, 'en');
      expect(result).toMatch(/\$1,234\.56|USD/);
    });

    it('should handle currency display options', () => {
      const result = formatCurrency(1234.56, { 
        currency: 'CAD',
        currencyDisplay: 'code' 
      }, 'en');
      expect(result).toMatch(/CAD/);
    });

    it('should handle invalid amounts', () => {
      const result = formatCurrency('invalid', {}, 'en');
      expect(result).toBe('Invalid Amount');
    });

    it('should fallback on formatting errors', () => {
      // Test with invalid currency code
      const result = formatCurrency(1234.56, { currency: 'INVALID' }, 'en');
      expect(result).toMatch(/\$1,234\.56/); // Should fallback to basic formatting
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage in English', () => {
      const result = formatPercentage(25.5, {}, 'en');
      expect(result).toBe('25.5%');
    });

    it('should format percentage in French Canadian', () => {
      const result = formatPercentage(25.5, {}, 'fr-CA');
      expect(result).toBe('25,5 %');
    });

    it('should handle decimal multiplier', () => {
      const result = formatPercentage(0.255, { multiplier: 100 }, 'en');
      expect(result).toBe('25.5%');
    });

    it('should handle fraction digits', () => {
      const result = formatPercentage(25.555, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }, 'en');
      expect(result).toBe('25.56%');
    });

    it('should handle invalid percentages', () => {
      const result = formatPercentage('invalid', {}, 'en');
      expect(result).toBe('Invalid Percentage');
    });

    it('should fallback on formatting errors', () => {
      // Mock Intl.NumberFormat to throw error
      const originalNumberFormat = Intl.NumberFormat;
      vi.stubGlobal('Intl', {
        ...Intl,
        NumberFormat: vi.fn().mockImplementation(() => {
          throw new Error('Formatting error');
        })
      });

      const result = formatPercentage(25.5, {}, 'en');
      expect(result).toBe('25.5%'); // Should fallback

      vi.stubGlobal('Intl', { ...Intl, NumberFormat: originalNumberFormat });
    });
  });

  describe('formatDecimalAsPercentage', () => {
    it('should convert decimal to percentage', () => {
      const result = formatDecimalAsPercentage(0.255, {}, 'en');
      expect(result).toBe('25.5%');
    });

    it('should handle formatting options', () => {
      const result = formatDecimalAsPercentage(0.25555, {
        maximumFractionDigits: 2,
      }, 'en');
      expect(result).toBe('25.56%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes in binary units', () => {
      expect(formatFileSize(0, {}, 'en')).toBe('0 B');
      expect(formatFileSize(1024, {}, 'en')).toBe('1 KiB');
      expect(formatFileSize(1048576, {}, 'en')).toBe('1 MiB');
      expect(formatFileSize(1073741824, {}, 'en')).toBe('1 GiB');
    });

    it('should format bytes in decimal units', () => {
      expect(formatFileSize(1000, { binary: false }, 'en')).toBe('1 KB');
      expect(formatFileSize(1000000, { binary: false }, 'en')).toBe('1 MB');
    });

    it('should handle fractional sizes', () => {
      const result = formatFileSize(1536, {}, 'en'); // 1.5 KiB
      expect(result).toBe('1.5 KiB');
    });

    it('should handle custom fraction digits', () => {
      const result = formatFileSize(1536, { maximumFractionDigits: 2 }, 'en');
      expect(result).toBe('1.5 KiB');
    });

    it('should handle invalid sizes', () => {
      expect(formatFileSize('invalid', {}, 'en')).toBe('Invalid Size');
      expect(formatFileSize(-100, {}, 'en')).toBe('Invalid Size');
    });

    it('should handle very large sizes', () => {
      const result = formatFileSize(1125899906842624, {}, 'en'); // 1 PiB
      expect(result).toBe('1 PiB');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format compact numbers in English', () => {
      expect(formatCompactNumber(1000, {}, 'en')).toBe('1K');
      expect(formatCompactNumber(1500, {}, 'en')).toBe('1.5K');
      expect(formatCompactNumber(1000000, {}, 'en')).toBe('1M');
    });

    it('should format compact numbers in French Canadian', () => {
      const result = formatCompactNumber(1000, {}, 'fr-CA');
      expect(result).toMatch(/1\s?k|1K/); // French may use different formatting
    });

    it('should handle different notations', () => {
      const scientific = formatCompactNumber(1000, { notation: 'scientific' }, 'en');
      expect(scientific).toMatch(/1E3|1×10³/);
    });

    it('should handle invalid numbers', () => {
      const result = formatCompactNumber('invalid', {}, 'en');
      expect(result).toBe('Invalid Number');
    });

    it('should fallback on formatting errors', () => {
      // Mock Intl.NumberFormat to throw error
      const originalNumberFormat = Intl.NumberFormat;
      vi.stubGlobal('Intl', {
        ...Intl,
        NumberFormat: vi.fn().mockImplementation(() => {
          throw new Error('Formatting error');
        })
      });

      const result = formatCompactNumber(1500, {}, 'en');
      expect(result).toBe('1500'); // Should fallback

      vi.stubGlobal('Intl', { ...Intl, NumberFormat: originalNumberFormat });
    });
  });

  describe('formatDuration', () => {
    it('should format duration in short format (English)', () => {
      expect(formatDuration(0, {}, 'en')).toBe('0s');
      expect(formatDuration(60, {}, 'en')).toBe('1m');
      expect(formatDuration(3600, {}, 'en')).toBe('1h');
      expect(formatDuration(3661, {}, 'en')).toBe('1h 1m'); // 1 hour 1 minute 1 second, but maxUnits=2
    });

    it('should format duration in short format (French Canadian)', () => {
      expect(formatDuration(60, {}, 'fr-CA')).toBe('1m');
      expect(formatDuration(3600, {}, 'fr-CA')).toBe('1h');
      expect(formatDuration(86400, {}, 'fr-CA')).toBe('1j'); // 1 day
    });

    it('should format duration in long format (English)', () => {
      expect(formatDuration(60, { format: 'long' }, 'en')).toBe('1 minute');
      expect(formatDuration(120, { format: 'long' }, 'en')).toBe('2 minutes');
      expect(formatDuration(3600, { format: 'long' }, 'en')).toBe('1 hour');
    });

    it('should format duration in long format (French Canadian)', () => {
      expect(formatDuration(60, { format: 'long' }, 'fr-CA')).toBe('1 minute');
      expect(formatDuration(120, { format: 'long' }, 'fr-CA')).toBe('2 minutes');
      expect(formatDuration(3600, { format: 'long' }, 'fr-CA')).toBe('1 heure');
      expect(formatDuration(7200, { format: 'long' }, 'fr-CA')).toBe('2 heures');
    });

    it('should handle maxUnits option', () => {
      const result = formatDuration(3661, { maxUnits: 3 }, 'en'); // 1h 1m 1s
      expect(result).toBe('1h 1m 1s');
    });

    it('should handle invalid durations', () => {
      expect(formatDuration('invalid', {}, 'en')).toBe('Invalid Duration');
      expect(formatDuration(-100, {}, 'en')).toBe('Invalid Duration');
    });

    it('should handle complex durations', () => {
      const result = formatDuration(90061, {}, 'en'); // 1 day 1 hour 1 minute 1 second
      expect(result).toBe('1d 1h'); // Should show only first 2 units
    });
  });

  describe('parseLocalizedNumber', () => {
    it('should parse English formatted numbers', () => {
      expect(parseLocalizedNumber('1,234.56', 'en')).toBe(1234.56);
      expect(parseLocalizedNumber('1234.56', 'en')).toBe(1234.56);
    });

    it('should parse French Canadian formatted numbers', () => {
      expect(parseLocalizedNumber('1 234,56', 'fr-CA')).toBe(1234.56);
      expect(parseLocalizedNumber('1234,56', 'fr-CA')).toBe(1234.56);
    });

    it('should handle invalid input', () => {
      expect(parseLocalizedNumber('invalid', 'en')).toBe(null);
      expect(parseLocalizedNumber('', 'en')).toBe(null);
      expect(parseLocalizedNumber(null as any, 'en')).toBe(null);
    });

    it('should handle parsing errors', () => {
      const result = parseLocalizedNumber('abc123def', 'en');
      expect(result).toBe(null);
    });
  });

  describe('getDecimalSeparator', () => {
    it('should return correct decimal separator for English', () => {
      const separator = getDecimalSeparator('en');
      expect(separator).toBe('.');
    });

    it('should return correct decimal separator for French Canadian', () => {
      const separator = getDecimalSeparator('fr-CA');
      expect(separator).toBe(',');
    });

    it('should handle errors gracefully', () => {
      // Mock Intl.NumberFormat to throw error
      const originalNumberFormat = Intl.NumberFormat;
      vi.stubGlobal('Intl', {
        ...Intl,
        NumberFormat: vi.fn().mockImplementation(() => {
          throw new Error('Formatting error');
        })
      });

      const separator = getDecimalSeparator('en');
      expect(separator).toBe('.'); // Should fallback

      vi.stubGlobal('Intl', { ...Intl, NumberFormat: originalNumberFormat });
    });
  });

  describe('getThousandsSeparator', () => {
    it('should return correct thousands separator for English', () => {
      const separator = getThousandsSeparator('en');
      expect(separator).toBe(',');
    });

    it('should return correct thousands separator for French Canadian', () => {
      const separator = getThousandsSeparator('fr-CA');
      expect(separator).toBe(' '); // Non-breaking space
    });

    it('should handle errors gracefully', () => {
      // Mock Intl.NumberFormat to throw error
      const originalNumberFormat = Intl.NumberFormat;
      vi.stubGlobal('Intl', {
        ...Intl,
        NumberFormat: vi.fn().mockImplementation(() => {
          throw new Error('Formatting error');
        })
      });

      const separator = getThousandsSeparator('en');
      expect(separator).toBe(','); // Should fallback

      vi.stubGlobal('Intl', { ...Intl, NumberFormat: originalNumberFormat });
    });
  });
});
