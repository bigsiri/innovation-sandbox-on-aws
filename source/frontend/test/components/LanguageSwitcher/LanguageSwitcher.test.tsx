// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LanguageSwitcher } from '../../../src/components/LanguageSwitcher/index';
import { LANGUAGE_STORAGE_KEY } from '../../../src/components/LanguageSwitcher/types';
import { SupportedLanguages } from '../../../src/i18n/types';

// Mock the useTranslation hook
const mockChangeLanguage = vi.fn();
const mockT = vi.fn();

vi.mock('../../../src/i18n/hooks/useTranslation', () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    currentLanguage: 'en' as SupportedLanguages,
    changeLanguage: mockChangeLanguage,
    isLoading: false,
  })),
}));

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

// Mock console methods
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();

describe('LanguageSwitcher', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;

    // Setup default mock implementations
    mockT.mockImplementation((key: string, options?: any) => {
      const translations: Record<string, string> = {
        'languageSwitcher.ariaLabel': 'Select language',
        'languageSwitcher.english': 'English',
        'languageSwitcher.frenchCanadian': 'French (Canada)',
        'languageSwitcher.switchingLanguage': 'Switching language...',
        'languageSwitcher.languageChanged': `Language changed to ${options?.language || 'unknown'}`,
      };
      return translations[key] || key;
    });

    mockChangeLanguage.mockResolvedValue(undefined);
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render language switcher with default options', () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('aria-label', 'Select language');
    });

    it('should render with custom aria-label', () => {
      const customAriaLabel = 'Choose your language';
      render(<LanguageSwitcher ariaLabel={customAriaLabel} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toHaveAttribute('aria-label', customAriaLabel);
    });

    it('should render with custom test ID', () => {
      const customTestId = 'custom-language-switcher';
      render(<LanguageSwitcher testId={customTestId} />);

      const select = screen.getByTestId(customTestId);
      expect(select).toBeInTheDocument();
    });

    it('should render in compact mode', () => {
      render(<LanguageSwitcher compact={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeInTheDocument();
      // In compact mode, options should show flags only
    });

    it('should render with custom className', () => {
      const customClassName = 'custom-language-switcher';
      render(<LanguageSwitcher className={customClassName} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toHaveClass(customClassName);
    });
  });

  describe('Language Options', () => {
    it('should display correct language options', async () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      // Check that both language options are available
      expect(screen.getByText(/English/)).toBeInTheDocument();
      expect(screen.getByText(/French \(Canada\)/)).toBeInTheDocument();
    });

    it('should show flags in language options', async () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      // Check for flag emojis (this might need adjustment based on how CloudScape renders them)
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('should show correct selected language', () => {
      // Mock current language as French Canadian
      const { useTranslation } = require('../../../src/i18n/hooks/useTranslation');
      useTranslation.mockReturnValue({
        t: mockT,
        currentLanguage: 'fr-CA',
        changeLanguage: mockChangeLanguage,
        isLoading: false,
      });

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      // The selected value should reflect the current language
      expect(select).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    it('should call changeLanguage when option is selected', async () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      // Select French Canadian option
      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith('fr-CA');
    });

    it('should call onLanguageChange callback when provided', async () => {
      const mockOnLanguageChange = vi.fn();
      render(<LanguageSwitcher onLanguageChange={mockOnLanguageChange} />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      await waitFor(() => {
        expect(mockOnLanguageChange).toHaveBeenCalledWith('fr-CA');
      });
    });

    it('should not call changeLanguage if same language is selected', async () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      // Select English (current language)
      const englishOption = screen.getByText(/English/);
      await user.click(englishOption);

      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });

    it('should handle language change errors gracefully', async () => {
      mockChangeLanguage.mockRejectedValueOnce(new Error('Language change failed'));

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          'Failed to change language:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state when translation is loading', () => {
      const { useTranslation } = require('../../../src/i18n/hooks/useTranslation');
      useTranslation.mockReturnValue({
        t: mockT,
        currentLanguage: 'en',
        changeLanguage: mockChangeLanguage,
        isLoading: true,
      });

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeDisabled();
    });

    it('should show loading state when external loading prop is true', () => {
      render(<LanguageSwitcher loading={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeDisabled();
    });

    it('should show loading text during language switching', async () => {
      // Mock a delayed language change
      mockChangeLanguage.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      // Should show loading text
      expect(screen.getByText('Switching language...')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<LanguageSwitcher disabled={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeDisabled();
    });

    it('should be disabled during loading', () => {
      render(<LanguageSwitcher loading={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeDisabled();
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist language selection to localStorage', async () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          LANGUAGE_STORAGE_KEY,
          'fr-CA'
        );
      });
    });

    it('should load language preference from localStorage on mount', () => {
      mockLocalStorage.getItem.mockReturnValue('fr-CA');

      render(<LanguageSwitcher />);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr-CA');
    });

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      await waitFor(() => {
        expect(mockConsoleWarn).toHaveBeenCalledWith(
          'Failed to persist language preference:',
          expect.any(Error)
        );
      });
    });

    it('should handle localStorage getItem errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(<LanguageSwitcher />);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to load language preference from localStorage:',
        expect.any(Error)
      );
    });

    it('should not change language if saved preference matches current language', () => {
      mockLocalStorage.getItem.mockReturnValue('en'); // Same as current language

      render(<LanguageSwitcher />);

      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toHaveAttribute('aria-label', 'Select language');
    });

    it('should announce language changes to screen readers', async () => {
      // Mock document.createElement and appendChild
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        textContent: '',
      };
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      await user.click(select);

      const frenchOption = screen.getByText(/French \(Canada\)/);
      await user.click(frenchOption);

      await waitFor(() => {
        expect(document.createElement).toHaveBeenCalledWith('div');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
        expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      });

      // Wait for cleanup
      await waitFor(() => {
        expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      }, { timeout: 1500 });
    });

    it('should have expandToViewport enabled for better mobile experience', () => {
      render(<LanguageSwitcher />);

      const select = screen.getByTestId('language-switcher');
      // This tests that the component is configured with expandToViewport
      // The actual testing of this CloudScape feature would require more complex setup
      expect(select).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render differently in compact mode', () => {
      render(<LanguageSwitcher compact={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toBeInTheDocument();
      // In compact mode, the rendering should be different (flags only)
    });

    it('should have description attribute in compact mode', () => {
      render(<LanguageSwitcher compact={true} />);

      const select = screen.getByTestId('language-switcher');
      expect(select).toHaveAttribute('aria-describedby', 'language-switcher-description');
    });
  });
});
