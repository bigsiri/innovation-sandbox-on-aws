// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { 
  renderWithI18n, 
  renderWithLanguage, 
  renderBilingual,
  createMockI18nInstance,
  mockUseTranslation,
  languageSwitchingUtils
} from '../../src/test/i18n-test-utils';
import { 
  validateTranslationKeyExists,
  getExpectedTranslation,
  testPluralization,
  testInterpolation,
  expectTranslatedText,
  validateBilingualTranslations
} from '../../src/test/translation-test-helpers';
import { commonTestKeys } from '../../src/test/mock-translations';

// Test component for i18n testing
const TestComponent: React.FC<{ translationKey: string; namespace?: string }> = ({ 
  translationKey, 
  namespace = 'common' 
}) => {
  const mockTranslation = mockUseTranslation();
  const text = mockTranslation.t(translationKey);
  
  return <div data-testid="test-content">{text}</div>;
};

// Test component with interpolation
const TestInterpolationComponent: React.FC = () => {
  const mockTranslation = mockUseTranslation();
  const text = mockTranslation.t('welcome', { replace: { name: 'John' } });
  
  return <div data-testid="interpolation-content">{text}</div>;
};

// Test component with pluralization
const TestPluralizationComponent: React.FC<{ count: number }> = ({ count }) => {
  const mockTranslation = mockUseTranslation();
  const text = mockTranslation.t('item', { count });
  
  return <div data-testid="plural-content">{text}</div>;
};

describe('i18n Test Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMockI18nInstance', () => {
    it('should create a mock i18n instance with English by default', async () => {
      const i18nInstance = await createMockI18nInstance();
      
      expect(i18nInstance.language).toBe('en');
      expect(i18nInstance.isInitialized).toBe(true);
    });

    it('should create a mock i18n instance with specified language', async () => {
      const i18nInstance = await createMockI18nInstance('fr-CA');
      
      expect(i18nInstance.language).toBe('fr-CA');
      expect(i18nInstance.isInitialized).toBe(true);
    });
  });

  describe('renderWithI18n', () => {
    it('should render component with English translations by default', async () => {
      const { getByTestId } = await renderWithI18n(
        <TestComponent translationKey={commonTestKeys.SAVE} />
      );
      
      const content = getByTestId('test-content');
      expect(content).toHaveTextContent('Save');
    });

    it('should render component with French Canadian translations', async () => {
      const { getByTestId } = await renderWithI18n(
        <TestComponent translationKey={commonTestKeys.SAVE} />,
        { language: 'fr-CA' }
      );
      
      const content = getByTestId('test-content');
      expect(content).toHaveTextContent('Enregistrer');
    });
  });

  describe('renderWithLanguage', () => {
    it('should render component with specified language', async () => {
      const { getByTestId } = await renderWithLanguage(
        <TestComponent translationKey={commonTestKeys.CANCEL} />,
        'fr-CA'
      );
      
      const content = getByTestId('test-content');
      expect(content).toHaveTextContent('Annuler');
    });
  });

  describe('renderBilingual', () => {
    it('should render component in both languages', async () => {
      const { english, french } = await renderBilingual(
        <TestComponent translationKey={commonTestKeys.LOADING} />
      );
      
      const englishContent = english.getByTestId('test-content');
      const frenchContent = french.getByTestId('test-content');
      
      expect(englishContent).toHaveTextContent('Loading...');
      expect(frenchContent).toHaveTextContent('Chargement...');
    });
  });

  describe('mockUseTranslation', () => {
    it('should return correct translation for English', () => {
      const mockTranslation = mockUseTranslation('en');
      
      expect(mockTranslation.t('save')).toBe('Save');
      expect(mockTranslation.t('cancel')).toBe('Cancel');
      expect(mockTranslation.i18n.language).toBe('en');
    });

    it('should return correct translation for French Canadian', () => {
      const mockTranslation = mockUseTranslation('fr-CA');
      
      expect(mockTranslation.t('save')).toBe('Enregistrer');
      expect(mockTranslation.t('cancel')).toBe('Annuler');
      expect(mockTranslation.i18n.language).toBe('fr-CA');
    });

    it('should handle interpolation', () => {
      const mockTranslation = mockUseTranslation('en');
      
      const result = mockTranslation.t('welcome', { replace: { name: 'John' } });
      expect(result).toBe('Welcome, John!');
    });

    it('should handle count interpolation', () => {
      const mockTranslation = mockUseTranslation('en');
      
      const result = mockTranslation.t('item_other', { count: 5 });
      expect(result).toBe('You have 5 items');
    });
  });
});

describe('Translation Test Helpers', () => {
  describe('validateTranslationKeyExists', () => {
    it('should validate existing translation keys', () => {
      expect(validateTranslationKeyExists('save')).toBe(true);
      expect(validateTranslationKeyExists('cancel')).toBe(true);
      expect(validateTranslationKeyExists('loading')).toBe(true);
    });

    it('should validate nested translation keys', () => {
      expect(validateTranslationKeyExists('languageSwitcher.ariaLabel')).toBe(true);
      expect(validateTranslationKeyExists('languageSwitcher.english')).toBe(true);
    });

    it('should return false for non-existing keys', () => {
      expect(validateTranslationKeyExists('nonexistent.key')).toBe(false);
      expect(validateTranslationKeyExists('missing')).toBe(false);
    });

    it('should validate keys in different languages', () => {
      expect(validateTranslationKeyExists('save', 'en')).toBe(true);
      expect(validateTranslationKeyExists('save', 'fr-CA')).toBe(true);
    });

    it('should validate keys in different namespaces', () => {
      expect(validateTranslationKeyExists('home', 'en', 'navigation')).toBe(true);
      expect(validateTranslationKeyExists('leases', 'en', 'navigation')).toBe(true);
    });
  });

  describe('getExpectedTranslation', () => {
    it('should return correct translation for basic keys', () => {
      expect(getExpectedTranslation('save', 'en')).toBe('Save');
      expect(getExpectedTranslation('save', 'fr-CA')).toBe('Enregistrer');
    });

    it('should handle nested keys', () => {
      expect(getExpectedTranslation('languageSwitcher.ariaLabel', 'en')).toBe('Select language');
      expect(getExpectedTranslation('languageSwitcher.ariaLabel', 'fr-CA')).toBe('Sélectionner la langue');
    });

    it('should handle interpolation', () => {
      const result = getExpectedTranslation('welcome', 'en', 'common', {
        replace: { name: 'Alice' }
      });
      expect(result).toBe('Welcome, Alice!');
    });

    it('should handle pluralization', () => {
      const singular = getExpectedTranslation('item', 'en', 'common', { count: 1 });
      const plural = getExpectedTranslation('item', 'en', 'common', { count: 5 });
      
      expect(singular).toBe('You have 1 item');
      expect(plural).toBe('You have 5 items');
    });
  });

  describe('testPluralization', () => {
    it('should test pluralization correctly', () => {
      const result = testPluralization('item', 'en');
      
      expect(result.singular).toBe('You have 1 item');
      expect(result.plural).toBe('You have 5 items');
      expect(result.isDifferent).toBe(true);
    });

    it('should test pluralization in French Canadian', () => {
      const result = testPluralization('item', 'fr-CA');
      
      expect(result.singular).toBe('Vous avez 1 élément');
      expect(result.plural).toBe('Vous avez 5 éléments');
      expect(result.isDifferent).toBe(true);
    });
  });

  describe('testInterpolation', () => {
    it('should test interpolation correctly', () => {
      const result = testInterpolation('welcome', { name: 'Bob' }, 'en');
      
      expect(result.original).toBe('Welcome, {{name}}!');
      expect(result.interpolated).toBe('Welcome, Bob!');
      expect(result.hasInterpolation).toBe(true);
    });

    it('should test complex interpolation', () => {
      const result = testInterpolation('greeting', { name: 'Alice', count: 3 }, 'en');
      
      expect(result.interpolated).toBe('Hello Alice, you have 3 notifications');
      expect(result.hasInterpolation).toBe(true);
    });
  });

  describe('validateBilingualTranslations', () => {
    it('should validate that keys exist in both languages', () => {
      const keys = ['save', 'cancel', 'loading'];
      const result = validateBilingualTranslations(keys);
      
      expect(result.valid).toBe(true);
      expect(result.missing.en).toHaveLength(0);
      expect(result.missing['fr-CA']).toHaveLength(0);
    });

    it('should detect missing translations', () => {
      const keys = ['save', 'nonexistent', 'cancel'];
      const result = validateBilingualTranslations(keys);
      
      expect(result.valid).toBe(false);
      expect(result.missing.en).toContain('nonexistent');
      expect(result.missing['fr-CA']).toContain('nonexistent');
    });

    it('should validate nested keys', () => {
      const keys = ['languageSwitcher.ariaLabel', 'languageSwitcher.english'];
      const result = validateBilingualTranslations(keys);
      
      expect(result.valid).toBe(true);
    });
  });
});

describe('Language Switching Utils', () => {
  describe('languageSwitchingUtils', () => {
    it('should create language switch test', async () => {
      const testComponent = <TestComponent translationKey="save" />;
      
      const testCases = [
        {
          key: 'save',
          expectedEn: 'Save',
          expectedFr: 'Enregistrer'
        }
      ];
      
      const test = languageSwitchingUtils.createLanguageSwitchTest(testComponent, testCases);
      
      // This should not throw
      await expect(test()).resolves.not.toThrow();
    });
  });
});

describe('Integration Tests', () => {
  it('should render component with interpolation in both languages', async () => {
    const { english, french } = await renderBilingual(
      <TestInterpolationComponent />
    );
    
    expect(english.getByTestId('interpolation-content')).toHaveTextContent('Welcome, John!');
    expect(french.getByTestId('interpolation-content')).toHaveTextContent('Bienvenue, John !');
  });

  it('should render component with pluralization in both languages', async () => {
    const { english, french } = await renderBilingual(
      <TestPluralizationComponent count={5} />
    );
    
    expect(english.getByTestId('plural-content')).toHaveTextContent('You have 5 items');
    expect(french.getByTestId('plural-content')).toHaveTextContent('Vous avez 5 éléments');
  });

  it('should handle namespace-specific translations', async () => {
    const { english, french } = await renderBilingual(
      <TestComponent translationKey="home" namespace="navigation" />
    );
    
    expect(english.getByTestId('test-content')).toHaveTextContent('Home');
    expect(french.getByTestId('test-content')).toHaveTextContent('Accueil');
  });
});
