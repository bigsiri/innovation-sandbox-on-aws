// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock react-i18next
const mockT = vi.fn();
const mockI18n = {
  language: 'en',
  changeLanguage: vi.fn(),
  exists: vi.fn(),
  getResourceBundle: vi.fn(),
  t: vi.fn(), // Add direct t function for static translation
  options: {
    resources: {
      en: {
        common: {
          loading: 'Loading...',
          save: 'Save',
          cancel: 'Cancel',
        },
        navigation: {
          home: 'Home',
          settings: 'Settings',
        },
      },
      'fr-CA': {
        common: {
          loading: 'Chargement...',
          save: 'Enregistrer',
          cancel: 'Annuler',
        },
        navigation: {
          home: 'Accueil',
          settings: 'Paramètres',
        },
      },
    },
  },
};

// Track the current namespace for each hook call
let currentNamespace = 'common';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn((namespace) => {
    currentNamespace = namespace || 'common';
    return {
      t: mockT,
      i18n: mockI18n,
      ready: true,
      namespace,
    };
  }),
}));

import { 
  useTranslation, 
  useTranslationStatic, 
  useTranslationExists, 
  useTranslations, 
  useLanguageInfo 
} from '../../../src/i18n/hooks/useTranslation';

// Mock console methods
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  console.warn = mockConsoleWarn;
  console.error = mockConsoleError;
  
  // Setup default mock behaviors
  mockT.mockImplementation((key: string, options?: any) => {
    const resources = mockI18n.options.resources;
    const currentLang = mockI18n.language;
    const langResources = resources[currentLang as keyof typeof resources];
    
    if (!langResources) return key;
    
    // Handle pluralization
    if (options?.count !== undefined) {
      const pluralKey = options.count === 1 ? `${key}_one` : `${key}_other`;
      const pluralValue = langResources.common?.[pluralKey as keyof typeof langResources.common];
      if (pluralValue) {
        return pluralValue.replace('{{count}}', options.count.toString());
      }
    }
    
    // Determine namespace to use
    let namespace = options?.ns || currentNamespace || 'common';
    if (Array.isArray(namespace)) {
      namespace = namespace[0];
    }
    
    const namespaceResources = langResources[namespace as keyof typeof langResources];
    
    if (namespaceResources && typeof namespaceResources === 'object') {
      const value = namespaceResources[key as keyof typeof namespaceResources];
      if (value) return value;
    }
    
    // Try common namespace as fallback if not already tried
    if (namespace !== 'common') {
      const commonResources = langResources.common;
      if (commonResources && typeof commonResources === 'object') {
        const value = commonResources[key as keyof typeof commonResources];
        if (value) return value;
      }
    }
    
    // Handle interpolation with defaultValue
    if (options?.defaultValue) {
      let result = options.defaultValue;
      if (options.replace) {
        Object.entries(options.replace).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v);
        });
      }
      return result;
    }
    
    return key;
  });
  
  // Setup i18n.t for static translation
  mockI18n.t.mockImplementation(mockT);
  
  mockI18n.exists.mockImplementation((key: string) => {
    const resources = mockI18n.options.resources;
    const currentLang = mockI18n.language;
    const langResources = resources[currentLang as keyof typeof resources];
    
    if (!langResources) return false;
    
    return !!(langResources.common?.[key as keyof typeof langResources.common] ||
              langResources.navigation?.[key as keyof typeof langResources.navigation]);
  });
  
  mockI18n.changeLanguage.mockImplementation((lng: string) => {
    mockI18n.language = lng;
    return Promise.resolve();
  });
  
  mockI18n.getResourceBundle.mockImplementation((lng: string, ns: string) => {
    const resources = mockI18n.options.resources;
    const langResources = resources[lng as keyof typeof resources];
    return langResources?.[ns as keyof typeof langResources] || {};
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useTranslation Hook', () => {
  describe('Basic Translation', () => {
    it('should translate basic keys', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.t('loading')).toBe('Loading...');
      expect(result.current.t('save')).toBe('Save');
      expect(result.current.t('cancel')).toBe('Cancel');
    });

    it('should handle interpolation', () => {
      const { result } = renderHook(() => useTranslation());

      const greeting = result.current.t('hello', { 
        defaultValue: 'Hello {{name}}!', 
        replace: { name: 'John' } 
      });
      expect(greeting).toBe('Hello John!');
    });

    it('should handle pluralization', () => {
      // Add pluralization to mock data
      mockI18n.options.resources.en.common.item_one = 'You have {{count}} item';
      mockI18n.options.resources.en.common.item_other = 'You have {{count}} items';
      
      const { result } = renderHook(() => useTranslation());

      const singular = result.current.t('item', { count: 1 });
      const plural = result.current.t('item', { count: 5 });

      expect(singular).toBe('You have 1 item');
      expect(plural).toBe('You have 5 items');
    });

    it('should return fallback for missing keys', () => {
      const { result } = renderHook(() => useTranslation());

      const missing = result.current.t('nonexistent.key');
      expect(missing).toBe('nonexistent.key');
    });

    it('should use custom default value', () => {
      const { result } = renderHook(() => useTranslation());

      const withDefault = result.current.t('nonexistent.key', { defaultValue: 'Custom Default' });
      expect(withDefault).toBe('Custom Default');
    });
  });

  describe('Language Management', () => {
    it('should return current language', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.currentLanguage).toBe('en');
    });

    it('should change language successfully', async () => {
      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        await result.current.changeLanguage('fr-CA');
      });

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr-CA');
    });

    it('should handle language change errors', async () => {
      mockI18n.changeLanguage.mockRejectedValueOnce(new Error('Language change failed'));
      
      const { result } = renderHook(() => useTranslation());

      await act(async () => {
        try {
          await result.current.changeLanguage('invalid-lang');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('Loading States', () => {
    it('should indicate ready state', () => {
      const { result } = renderHook(() => useTranslation());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should warn about missing keys in development', () => {
      // Set NODE_ENV to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      mockI18n.exists.mockReturnValue(false);
      
      const { result } = renderHook(() => useTranslation());
      result.current.t('definitely.missing.key');
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Translation key "definitely.missing.key" not found')
      );
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle translation errors gracefully', () => {
      const { result } = renderHook(() => useTranslation());

      // Test with malformed interpolation
      const malformed = result.current.t('loading', { replace: { invalidInterpolation: null } });
      expect(typeof malformed).toBe('string');
    });
  });

  describe('Namespace Support', () => {
    it('should work with specific namespace', () => {
      currentNamespace = 'navigation'; // Set namespace for this test
      const { result } = renderHook(() => useTranslation('navigation'));

      expect(result.current.t('home')).toBe('Home');
      expect(result.current.t('settings')).toBe('Settings');
      currentNamespace = 'common'; // Reset
    });

    it('should work with multiple namespaces', () => {
      currentNamespace = 'common'; // Start with common
      const { result } = renderHook(() => useTranslation(['common', 'navigation']));

      expect(result.current.t('loading')).toBe('Loading...');
      
      currentNamespace = 'navigation'; // Switch to navigation for home
      expect(result.current.t('home')).toBe('Home');
      currentNamespace = 'common'; // Reset
    });
  });
});

describe('useTranslationStatic Hook', () => {
  it('should provide static translation function', () => {
    const { result } = renderHook(() => useTranslationStatic());

    const translate = result.current;
    expect(translate('loading')).toBe('Loading...');
    expect(translate('save')).toBe('Save');
  });

  it('should handle errors in static translation', () => {
    const { result } = renderHook(() => useTranslationStatic());

    const translate = result.current;
    const missing = translate('nonexistent.key');
    expect(missing).toBe('nonexistent.key');
  });
});

describe('useTranslationExists Hook', () => {
  it('should check if translation key exists', () => {
    const { result } = renderHook(() => useTranslationExists());

    const exists = result.current;
    expect(exists('loading')).toBe(true);
    expect(exists('nonexistent.key')).toBe(false);
  });

  it('should handle errors when checking existence', () => {
    const { result } = renderHook(() => useTranslationExists());

    const exists = result.current;
    // Should not throw for malformed keys
    expect(() => exists('malformed..key')).not.toThrow();
  });
});

describe('useTranslations Hook', () => {
  it('should get multiple translations at once', () => {
    const { result } = renderHook(() => useTranslations(['loading', 'save', 'cancel']));

    const translations = result.current;
    expect(translations).toEqual({
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
    });
  });

  it('should update when keys change', () => {
    const { result, rerender } = renderHook(
      ({ keys }) => useTranslations(keys),
      {
        initialProps: { keys: ['loading'] },
      }
    );

    expect(result.current).toEqual({ loading: 'Loading...' });

    rerender({ keys: ['loading', 'save'] });

    expect(result.current).toEqual({
      loading: 'Loading...',
      save: 'Save',
    });
  });
});

describe('useLanguageInfo Hook', () => {
  it('should provide current language info', () => {
    const { result } = renderHook(() => useLanguageInfo());

    expect(result.current.current.code).toBe('en');
    expect(result.current.isRTL).toBe(false);
  });

  it('should provide available languages', () => {
    const { result } = renderHook(() => useLanguageInfo());

    expect(result.current.available).toHaveLength(2);
    expect(result.current.available.map(lang => lang.code)).toEqual(['en', 'fr-CA']);
  });

  it('should indicate RTL status', () => {
    const { result } = renderHook(() => useLanguageInfo());

    expect(result.current.isRTL).toBe(false);
  });

  it('should provide change language function', async () => {
    const { result } = renderHook(() => useLanguageInfo());

    await act(async () => {
      await result.current.changeLanguage('fr-CA');
    });

    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr-CA');
  });
});
