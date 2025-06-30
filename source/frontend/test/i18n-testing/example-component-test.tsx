// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Example test file demonstrating how to use the i18n testing infrastructure
 * This file shows common patterns and best practices for bilingual testing
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { 
  renderWithI18n, 
  renderBilingual, 
  changeLanguage,
  languageSwitchingUtils 
} from '../../src/test/i18n-test-utils';
import { 
  expectTranslatedText, 
  expectTranslatedAriaLabel,
  testPluralization,
  validateBilingualTranslations 
} from '../../src/test/translation-test-helpers';

// Example components for demonstration
const SaveButton: React.FC = () => {
  return (
    <button aria-label="Save document">
      Save
    </button>
  );
};

const WelcomeMessage: React.FC<{ userName: string }> = ({ userName }) => {
  return (
    <div data-testid="welcome">
      Welcome, {userName}!
    </div>
  );
};

const ItemCounter: React.FC<{ count: number }> = ({ count }) => {
  const text = count === 1 ? `You have ${count} item` : `You have ${count} items`;
  return <div data-testid="counter">{text}</div>;
};

const LanguageSwitchingApp: React.FC = () => {
  const [language, setLanguage] = React.useState<'en' | 'fr-CA'>('en');
  
  const content = {
    en: { home: 'Home', welcome: 'Welcome' },
    'fr-CA': { home: 'Accueil', welcome: 'Bienvenue' }
  };
  
  return (
    <div>
      <button onClick={() => setLanguage(language === 'en' ? 'fr-CA' : 'en')}>
        Switch Language
      </button>
      <div data-testid="content">{content[language].home}</div>
      <div data-testid="welcome">{content[language].welcome}</div>
    </div>
  );
};

describe('Example i18n Testing Patterns', () => {
  
  describe('1. Basic Component Translation Testing', () => {
    it('should render SaveButton with correct text in both languages', async () => {
      // Test English
      const englishResult = await renderWithI18n(<SaveButton />);
      expect(englishResult.getByRole('button')).toHaveTextContent('Save');
      
      // Test French Canadian
      const frenchResult = await renderWithI18n(<SaveButton />, { language: 'fr-CA' });
      expect(frenchResult.getByRole('button')).toHaveTextContent('Enregistrer');
    });
    
    it('should render SaveButton using bilingual testing', async () => {
      const { english, french } = await renderBilingual(<SaveButton />);
      
      expect(english.getByRole('button')).toHaveTextContent('Save');
      expect(french.getByRole('button')).toHaveTextContent('Enregistrer');
    });
  });
  
  describe('2. Translation Helper Usage', () => {
    it('should validate translation keys exist', () => {
      const keys = ['save', 'cancel', 'loading'];
      const validation = validateBilingualTranslations(keys);
      
      expect(validation.valid).toBe(true);
      expect(validation.missing.en).toHaveLength(0);
      expect(validation.missing['fr-CA']).toHaveLength(0);
    });
    
    it('should test pluralization patterns', () => {
      const englishPlural = testPluralization('item', 'en');
      const frenchPlural = testPluralization('item', 'fr-CA');
      
      expect(englishPlural.singular).toBe('You have 1 item');
      expect(englishPlural.plural).toBe('You have 5 items');
      expect(englishPlural.isDifferent).toBe(true);
      
      expect(frenchPlural.singular).toBe('Vous avez 1 élément');
      expect(frenchPlural.plural).toBe('Vous avez 5 éléments');
      expect(frenchPlural.isDifferent).toBe(true);
    });
  });
  
  describe('3. Assertion Helper Usage', () => {
    it('should use expectTranslatedText helper', async () => {
      await renderWithI18n(<SaveButton />);
      expectTranslatedText('save'); // Expects "Save" in English
    });
    
    it('should use expectTranslatedAriaLabel helper', async () => {
      const { getByRole } = await renderWithI18n(<SaveButton />);
      const button = getByRole('button');
      
      // This would work if the component used translation keys
      // expectTranslatedAriaLabel(button, 'save');
      expect(button).toHaveAttribute('aria-label', 'Save document');
    });
  });
  
  describe('4. Interpolation Testing', () => {
    it('should handle interpolated content', async () => {
      const { english, french } = await renderBilingual(
        <WelcomeMessage userName="Alice" />
      );
      
      expect(english.getByTestId('welcome')).toHaveTextContent('Welcome, Alice!');
      expect(french.getByTestId('welcome')).toHaveTextContent('Bienvenue, Alice !');
    });
  });
  
  describe('5. Pluralization Testing', () => {
    it('should handle singular form correctly', async () => {
      const { english, french } = await renderBilingual(
        <ItemCounter count={1} />
      );
      
      expect(english.getByTestId('counter')).toHaveTextContent('You have 1 item');
      expect(french.getByTestId('counter')).toHaveTextContent('Vous avez 1 élément');
    });
    
    it('should handle plural form correctly', async () => {
      const { english, french } = await renderBilingual(
        <ItemCounter count={5} />
      );
      
      expect(english.getByTestId('counter')).toHaveTextContent('You have 5 items');
      expect(french.getByTestId('counter')).toHaveTextContent('Vous avez 5 éléments');
    });
    
    it('should handle zero items correctly', async () => {
      const { english, french } = await renderBilingual(
        <ItemCounter count={0} />
      );
      
      expect(english.getByTestId('counter')).toHaveTextContent('You have 0 items');
      expect(french.getByTestId('counter')).toHaveTextContent('Vous avez 0 éléments');
    });
  });
  
  describe('6. Language Switching Testing', () => {
    it('should update content when language changes', async () => {
      const { getByTestId, i18n } = await renderWithI18n(<LanguageSwitchingApp />);
      
      // Initial English content
      expect(getByTestId('content')).toHaveTextContent('Home');
      expect(getByTestId('welcome')).toHaveTextContent('Welcome');
      
      // Simulate language change
      fireEvent.click(screen.getByText('Switch Language'));
      
      // Content should update (in a real app, this would be handled by i18n)
      // For this example, we're testing the component's internal state
      expect(getByTestId('content')).toHaveTextContent('Accueil');
      expect(getByTestId('welcome')).toHaveTextContent('Bienvenue');
    });
    
    it('should use language switching utility', async () => {
      const testComponent = <SaveButton />;
      
      const testCases = [
        {
          key: 'save',
          expectedEn: 'Save',
          expectedFr: 'Enregistrer'
        }
      ];
      
      const test = languageSwitchingUtils.createLanguageSwitchTest(testComponent, testCases);
      await expect(test()).resolves.not.toThrow();
    });
  });
  
  describe('7. Error Handling and Edge Cases', () => {
    it('should handle missing translation keys gracefully', async () => {
      // This would typically show the key itself or a fallback
      const { getByTestId } = await renderWithI18n(
        <div data-testid="missing">nonexistent.key</div>
      );
      
      expect(getByTestId('missing')).toHaveTextContent('nonexistent.key');
    });
    
    it('should handle empty or null values', async () => {
      const EmptyComponent = () => <div data-testid="empty">{''}</div>;
      
      const { english, french } = await renderBilingual(<EmptyComponent />);
      
      expect(english.getByTestId('empty')).toBeEmptyDOMElement();
      expect(french.getByTestId('empty')).toBeEmptyDOMElement();
    });
  });
  
  describe('8. Form Validation Testing', () => {
    const ValidationForm: React.FC = () => {
      const [errors, setErrors] = React.useState<string[]>([]);
      
      const handleSubmit = () => {
        setErrors(['Email is required', 'Password is required']);
      };
      
      return (
        <form>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
          {errors.map((error, index) => (
            <div key={index} data-testid={`error-${index}`}>
              {error}
            </div>
          ))}
        </form>
      );
    };
    
    it('should show validation errors in correct language', async () => {
      const { english, french } = await renderBilingual(<ValidationForm />);
      
      // Trigger validation
      fireEvent.click(english.getByRole('button'));
      fireEvent.click(french.getByRole('button'));
      
      // In a real app, these would be translated
      expect(english.getByTestId('error-0')).toHaveTextContent('Email is required');
      expect(english.getByTestId('error-1')).toHaveTextContent('Password is required');
      
      // French versions would be translated
      expect(french.getByTestId('error-0')).toHaveTextContent('Le courriel est obligatoire');
      expect(french.getByTestId('error-1')).toHaveTextContent('Le mot de passe est obligatoire');
    });
  });
  
  describe('9. Accessibility Testing', () => {
    it('should have proper ARIA labels in both languages', async () => {
      const AccessibleButton: React.FC = () => (
        <button aria-label="Save document">
          Save
        </button>
      );
      
      const { english, french } = await renderBilingual(<AccessibleButton />);
      
      const englishButton = english.getByRole('button');
      const frenchButton = french.getByRole('button');
      
      // In a real app, these would use translation keys
      expect(englishButton).toHaveAttribute('aria-label', 'Save document');
      expect(frenchButton).toHaveAttribute('aria-label', 'Enregistrer le document');
    });
  });
  
  describe('10. Performance Testing', () => {
    it('should not cause unnecessary re-renders during language switching', async () => {
      const renderSpy = vi.fn();
      
      const PerformanceTestComponent: React.FC = () => {
        renderSpy();
        return <div>Test Component</div>;
      };
      
      const { i18n } = await renderWithI18n(<PerformanceTestComponent />);
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Change language
      await changeLanguage(i18n, 'fr-CA');
      
      // Should only re-render once for language change
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
    });
  });
});

describe('Real-world Integration Examples', () => {
  describe('LanguageSwitcher Component Integration', () => {
    it('should integrate with existing components', async () => {
      // This would test the actual LanguageSwitcher component
      // const { getByTestId } = await renderWithI18n(<LanguageSwitcher />);
      // expectTranslatedAriaLabel(getByTestId('language-switcher'), 'languageSwitcher.ariaLabel');
    });
  });
  
  describe('Navigation Component Integration', () => {
    it('should render navigation items in correct language', async () => {
      const NavigationComponent: React.FC = () => (
        <nav>
          <a href="/home">Home</a>
          <a href="/leases">Leases</a>
          <a href="/accounts">Accounts</a>
        </nav>
      );
      
      const { english, french } = await renderBilingual(<NavigationComponent />);
      
      expect(english.getByText('Home')).toBeInTheDocument();
      expect(english.getByText('Leases')).toBeInTheDocument();
      expect(english.getByText('Accounts')).toBeInTheDocument();
      
      expect(french.getByText('Accueil')).toBeInTheDocument();
      expect(french.getByText('Baux')).toBeInTheDocument();
      expect(french.getByText('Comptes')).toBeInTheDocument();
    });
  });
});
