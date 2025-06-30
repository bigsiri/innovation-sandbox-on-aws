// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { 
  renderWithSimpleI18n, 
  renderSimpleBilingual,
  createMockUseTranslation 
} from '../../src/test/simple-i18n-test-utils';
import { 
  validateTranslationKeyExists,
  getExpectedTranslation,
  testPluralization,
  validateBilingualTranslations
} from '../../src/test/translation-test-helpers';

// Test component
const TestComponent: React.FC<{ translationKey: string }> = ({ translationKey }) => {
  const mockTranslation = createMockUseTranslation();
  const text = mockTranslation.t(translationKey);
  
  return <div data-testid="test-content">{text}</div>;
};

describe('Simple i18n Testing Infrastructure', () => {
  describe('Translation Key Validation', () => {
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
  });

  describe('Translation Retrieval', () => {
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
  });

  describe('Pluralization Testing', () => {
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

  describe('Bilingual Validation', () => {
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
  });

  describe('Component Rendering', () => {
    it('should render component with English translations', () => {
      const { getByTestId } = renderWithSimpleI18n(
        <TestComponent translationKey="save" />
      );
      
      const content = getByTestId('test-content');
      expect(content).toHaveTextContent('Save');
    });

    it('should render component with French Canadian translations', () => {
      const { getByTestId } = renderWithSimpleI18n(
        <TestComponent translationKey="save" />,
        { language: 'fr-CA' }
      );
      
      const content = getByTestId('test-content');
      expect(content).toHaveTextContent('Enregistrer');
    });

    it('should render component in both languages', () => {
      const { english, french } = renderSimpleBilingual(
        <TestComponent translationKey="loading" />
      );
      
      const englishContent = english.getByTestId('test-content');
      const frenchContent = french.getByTestId('test-content');
      
      expect(englishContent).toHaveTextContent('Loading...');
      expect(frenchContent).toHaveTextContent('Chargement...');
    });
  });

  describe('Mock Translation Hook', () => {
    it('should return correct translation for English', () => {
      const mockTranslation = createMockUseTranslation('en');
      
      expect(mockTranslation.t('save')).toBe('Save');
      expect(mockTranslation.t('cancel')).toBe('Cancel');
      expect(mockTranslation.i18n.language).toBe('en');
    });

    it('should return correct translation for French Canadian', () => {
      const mockTranslation = createMockUseTranslation('fr-CA');
      
      expect(mockTranslation.t('save')).toBe('Enregistrer');
      expect(mockTranslation.t('cancel')).toBe('Annuler');
      expect(mockTranslation.i18n.language).toBe('fr-CA');
    });

    it('should handle nested keys', () => {
      const mockTranslation = createMockUseTranslation('en');
      
      const result = mockTranslation.t('languageSwitcher.ariaLabel');
      expect(result).toBe('Select language');
    });

    it('should handle interpolation', () => {
      const mockTranslation = createMockUseTranslation('en');
      
      const result = mockTranslation.t('welcome', { replace: { name: 'John' } });
      expect(result).toBe('Welcome, John!');
    });
  });
});
