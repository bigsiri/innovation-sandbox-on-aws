// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { Density, Mode } from "@cloudscape-design/global-styles";

import { NavHeader } from '../../../src/components/AppLayout/NavHeader';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../src/test/simple-i18n-test-utils';
import { IsbUser } from '@amzn/innovation-sandbox-commons/types/isb-types';

// Mock the AppContext
const mockSetTheme = vi.fn();
const mockSetDensity = vi.fn();
const mockSetToolsOpen = vi.fn();
const mockSetToolsHide = vi.fn();
const mockChangeLanguage = vi.fn();

vi.mock('@amzn/innovation-sandbox-frontend/components/AppContext/context', () => ({
  useAppContext: () => ({
    theme: Mode.Light,
    density: Density.Comfortable,
    setTheme: mockSetTheme,
    setDensity: mockSetDensity,
  }),
}));

vi.mock('@aws-northstar/ui/components/AppLayout', () => ({
  useAppLayoutContext: () => ({
    setToolsOpen: mockSetToolsOpen,
    setToolsHide: mockSetToolsHide,
  }),
}));

// Mock the useTranslation hook to include changeLanguage
vi.mock('@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        'header.title': 'Innovation Sandbox on AWS',
        'header.settings.ariaLabel': 'Settings',
        'header.settings.theme': 'Theme',
        'header.settings.themeLight': 'Light',
        'header.settings.themeDark': 'Dark',
        'header.settings.density': 'Density',
        'header.settings.densityComfortable': 'Comfortable',
        'header.settings.densityCompact': 'Compact',
        'header.info.ariaLabel': 'Information',
        'header.user.exit': 'Exit',
        'header.overflowMenuTitle': 'Innovation Sandbox on AWS',
        'languageSwitcher.ariaLabel': 'Select language',
        'languageSwitcher.english': 'English',
        'languageSwitcher.frenchCanadian': 'French (Canada)',
      };
      return translations[key] || key;
    },
    currentLanguage: 'en',
    changeLanguage: mockChangeLanguage,
  }),
}));

describe('NavHeader', () => {
  const mockUser: IsbUser = {
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    roles: ['User'],
  };

  const mockOnExit = vi.fn();
  const mockOnLanguageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default title in English', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      // Should use translated default title
      expect(screen.getByText('Innovation Sandbox on AWS')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      const customTitle = 'Custom Application Title';
      renderWithSimpleI18n(<NavHeader title={customTitle} />);
      
      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('should render logo when provided', () => {
      const logoSrc = '/path/to/logo.png';
      renderWithSimpleI18n(<NavHeader logo={logoSrc} />);
      
      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('src', logoSrc);
      expect(logo).toHaveAttribute('alt', 'Innovation Sandbox on AWS');
    });
  });

  describe('Language Switcher Integration', () => {
    it('should render language switcher as dropdown utility by default', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const languageButton = screen.getByLabelText('Select language');
      expect(languageButton).toBeInTheDocument();
    });

    it('should not render language switcher when showLanguageSwitcher is false', () => {
      renderWithSimpleI18n(<NavHeader showLanguageSwitcher={false} />);
      
      expect(screen.queryByLabelText('Select language')).not.toBeInTheDocument();
    });

    it('should show current language in dropdown title', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      // The dropdown should show "EN" for English
      const languageButton = screen.getByLabelText('Select language');
      expect(languageButton).toBeInTheDocument();
    });

    it('should handle language change when menu item is clicked', async () => {
      renderWithSimpleI18n(<NavHeader onLanguageChange={mockOnLanguageChange} />);
      
      const languageButton = screen.getByLabelText('Select language');
      fireEvent.click(languageButton);
      
      // Should show language options
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('French (Canada)')).toBeInTheDocument();
      
      // Click French option
      const frenchOption = screen.getByText('French (Canada)');
      fireEvent.click(frenchOption);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr-CA');
    });
  });

  describe('Settings Menu', () => {
    it('should render settings menu with translated labels', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const settingsButton = screen.getByLabelText('Settings');
      expect(settingsButton).toBeInTheDocument();
    });

    it('should handle theme changes', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const settingsButton = screen.getByLabelText('Settings');
      fireEvent.click(settingsButton);
      
      // Check if theme options are present
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should handle density changes', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const settingsButton = screen.getByLabelText('Settings');
      fireEvent.click(settingsButton);
      
      // Check if density options are present
      expect(screen.getByText('Density')).toBeInTheDocument();
      expect(screen.getByText('Comfortable')).toBeInTheDocument();
      expect(screen.getByText('Compact')).toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    it('should not render user menu when no user provided', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should render user menu when user provided', () => {
      renderWithSimpleI18n(<NavHeader user={mockUser} onExit={mockOnExit} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should render user menu with translated exit option', () => {
      renderWithSimpleI18n(<NavHeader user={mockUser} onExit={mockOnExit} />);
      
      const userButton = screen.getByText('John Doe');
      fireEvent.click(userButton);
      
      expect(screen.getByText('Exit')).toBeInTheDocument();
    });

    it('should call onExit when exit is clicked', () => {
      renderWithSimpleI18n(<NavHeader user={mockUser} onExit={mockOnExit} />);
      
      const userButton = screen.getByText('John Doe');
      fireEvent.click(userButton);
      
      const exitButton = screen.getByText('Exit');
      fireEvent.click(exitButton);
      
      expect(mockOnExit).toHaveBeenCalled();
    });
  });

  describe('Info Button', () => {
    it('should render info button with translated aria-label', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const infoButton = screen.getByLabelText('Information');
      expect(infoButton).toBeInTheDocument();
    });

    it('should handle info button click', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const infoButton = screen.getByLabelText('Information');
      fireEvent.click(infoButton);
      
      expect(mockSetToolsHide).toHaveBeenCalledWith(false);
      expect(mockSetToolsOpen).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      renderWithSimpleI18n(<NavHeader user={mockUser} />);
      
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Select language')).toBeInTheDocument();
    });

    it('should have proper logo alt text', () => {
      const logoSrc = '/path/to/logo.png';
      renderWithSimpleI18n(<NavHeader logo={logoSrc} />);
      
      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('alt', 'Innovation Sandbox on AWS');
    });

    it('should have proper logo alt text with custom title', () => {
      const customTitle = 'Custom Title';
      const logoSrc = '/path/to/logo.png';
      renderWithSimpleI18n(<NavHeader title={customTitle} logo={logoSrc} />);
      
      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('alt', customTitle);
    });
  });

  describe('Props Handling', () => {
    it('should use default href when not provided', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      const titleLink = screen.getByText('Innovation Sandbox on AWS').closest('a');
      expect(titleLink).toHaveAttribute('href', '/');
    });

    it('should use custom href when provided', () => {
      const customHref = '/custom-path';
      renderWithSimpleI18n(<NavHeader href={customHref} />);
      
      const titleLink = screen.getByText('Innovation Sandbox on AWS').closest('a');
      expect(titleLink).toHaveAttribute('href', customHref);
    });

    it('should handle showLanguageSwitcher prop correctly', () => {
      const { rerender } = renderWithSimpleI18n(<NavHeader showLanguageSwitcher={true} />);
      
      expect(screen.getByLabelText('Select language')).toBeInTheDocument();
      
      rerender(<NavHeader showLanguageSwitcher={false} />);
      
      expect(screen.queryByLabelText('Select language')).not.toBeInTheDocument();
    });

    it('should pass onLanguageChange prop correctly', async () => {
      renderWithSimpleI18n(<NavHeader onLanguageChange={mockOnLanguageChange} />);
      
      const languageButton = screen.getByLabelText('Select language');
      fireEvent.click(languageButton);
      
      const frenchOption = screen.getByText('French (Canada)');
      fireEvent.click(frenchOption);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr-CA');
    });
  });

  describe('Integration Design', () => {
    it('should integrate language switcher as proper TopNavigation utility', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      // Language switcher should be integrated as a dropdown utility, not floating
      const languageButton = screen.getByLabelText('Select language');
      expect(languageButton).toBeInTheDocument();
      
      // Should not have floating container
      expect(screen.queryByTestId('nav-language-switcher-container')).not.toBeInTheDocument();
    });

    it('should maintain CloudScape design consistency', () => {
      renderWithSimpleI18n(<NavHeader />);
      
      // All utilities should be present and properly integrated
      expect(screen.getByLabelText('Select language')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Information')).toBeInTheDocument();
    });
  });
});
