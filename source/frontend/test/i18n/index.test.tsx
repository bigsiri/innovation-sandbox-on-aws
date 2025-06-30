// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import i18n, { 
  initializeI18n, 
  DEFAULT_LANGUAGE, 
  SUPPORTED_LANGUAGES,
  DEFAULT_NAMESPACE,
  NAMESPACES 
} from '@amzn/innovation-sandbox-frontend/i18n';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
vi.stubGlobal('console', mockConsole);

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Mock successful fetch responses
    mockFetch.mockImplementation((url: string) => {
      const mockTranslations = {
        '/locales/en/common.json': {
          loading: 'Loading...',
          save: 'Save',
          cancel: 'Cancel',
        },
        '/locales/en/navigation.json': {
          home: 'Home',
          leases: 'Leases',
        },
        '/locales/fr-CA/common.json': {
          loading: 'Chargement...',
          save: 'Enregistrer',
          cancel: 'Annuler',
        },
        '/locales/fr-CA/navigation.json': {
          home: 'Accueil',
          leases: 'Baux',
        },
      };

      const data = mockTranslations[url as keyof typeof mockTranslations];
      
      if (data) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve(data),
        });
      }
      
      return Promise.reject(new Error(`Not found: ${url}`));
    });
  });

  afterEach(() => {
    // Reset i18n instance
    if (i18n.isInitialized) {
      i18n.services.resourceStore.data = {};
      i18n.isInitialized = false;
    }
  });

  describe('Configuration Constants', () => {
    it('should have correct default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('should have correct supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'fr-CA']);
    });

    it('should have correct default namespace', () => {
      expect(DEFAULT_NAMESPACE).toBe('common');
    });

    it('should have correct namespaces', () => {
      expect(NAMESPACES).toEqual(['common', 'navigation']);
    });
  });

  describe('i18n Initialization', () => {
    it('should initialize i18n successfully', async () => {
      const result = await initializeI18n();
      
      expect(result).toBe(i18n);
      expect(i18n.isInitialized).toBe(true);
      expect(i18n.language).toBe(DEFAULT_LANGUAGE);
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock fetch to fail
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Should still initialize with fallback config
      await expect(initializeI18n()).rejects.toThrow();
      
      // But i18n should still be initialized with minimal config
      expect(i18n.isInitialized).toBe(true);
    });

    it('should log successful initialization', async () => {
      await initializeI18n();
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        'i18n initialized successfully',
        expect.objectContaining({
          language: expect.any(String),
          languages: expect.any(Array),
          namespaces: expect.any(Array),
        })
      );
    });
  });

  describe('Language Detection', () => {
    it('should detect language from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('fr-CA');
      
      await initializeI18n();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    });

    it('should convert generic French to French Canadian', async () => {
      // Mock navigator language
      Object.defineProperty(navigator, 'language', {
        value: 'fr',
        configurable: true,
      });
      
      await initializeI18n();
      
      // The detection configuration should convert 'fr' to 'fr-CA'
      // This is tested through the convertDetectedLanguage function
      const convertFn = i18n.options.detection?.convertDetectedLanguage;
      if (convertFn) {
        expect(convertFn('fr')).toBe('fr-CA');
      }
    });

    it('should fallback to default language for unsupported languages', async () => {
      const convertFn = i18n.options.detection?.convertDetectedLanguage;
      if (convertFn) {
        expect(convertFn('es')).toBe(DEFAULT_LANGUAGE);
        expect(convertFn('de')).toBe(DEFAULT_LANGUAGE);
      }
    });
  });

  describe('Translation Loading', () => {
    it('should load translations via HTTP backend', async () => {
      await initializeI18n();
      
      // Verify fetch was called for translation files
      expect(mockFetch).toHaveBeenCalledWith(
        '/locales/en/common.json',
        expect.any(Object)
      );
    });

    it('should handle translation loading errors', async () => {
      // Mock fetch to fail for specific files
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('common.json')) {
          return Promise.reject(new Error('File not found'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });

      await initializeI18n();
      
      // Should log warning for failed translation loading
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load translation file'),
        expect.any(Error)
      );
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should use fallback language when translation is missing', async () => {
      await initializeI18n();
      
      expect(i18n.options.fallbackLng).toBe(DEFAULT_LANGUAGE);
    });

    it('should handle missing translation keys', async () => {
      await initializeI18n();
      
      // Test missing key handler
      const missingKeyHandler = i18n.options.missingKeyHandler;
      if (missingKeyHandler) {
        missingKeyHandler(['en'], 'common', 'nonexistent.key', 'fallback');
        
        // Should log warning in development mode
        expect(mockConsole.warn).toHaveBeenCalledWith(
          expect.stringContaining('Missing translation key')
        );
      }
    });
  });

  describe('Interpolation and Formatting', () => {
    it('should support custom formatting', async () => {
      await initializeI18n();
      
      const formatFn = i18n.options.interpolation?.format;
      if (formatFn) {
        expect(formatFn('hello', 'uppercase')).toBe('HELLO');
        expect(formatFn('WORLD', 'lowercase')).toBe('world');
        expect(formatFn('test', 'capitalize')).toBe('Test');
        expect(formatFn('unchanged')).toBe('unchanged');
      }
    });

    it('should not escape values for React', async () => {
      await initializeI18n();
      
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });

  describe('Development Features', () => {
    it('should enable debug mode in development', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      await initializeI18n();
      
      expect(i18n.options.debug).toBe(true);
      expect(i18n.options.saveMissing).toBe(true);
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should disable debug mode in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      await initializeI18n();
      
      expect(i18n.options.debug).toBe(false);
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('React Integration', () => {
    it('should configure React-specific options', async () => {
      await initializeI18n();
      
      expect(i18n.options.react?.useSuspense).toBe(false);
      expect(i18n.options.react?.bindI18n).toBe('languageChanged');
      expect(i18n.options.react?.bindI18nStore).toBe('added removed');
    });

    it('should support basic HTML nodes in translations', async () => {
      await initializeI18n();
      
      expect(i18n.options.react?.transSupportBasicHtmlNodes).toBe(true);
      expect(i18n.options.react?.transKeepBasicHtmlNodesFor).toEqual([
        'br', 'strong', 'i', 'em'
      ]);
    });
  });
});
