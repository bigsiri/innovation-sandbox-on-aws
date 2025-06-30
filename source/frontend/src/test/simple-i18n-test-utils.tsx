// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { SupportedLanguages } from '../i18n/types';
import { getMockI18nResources } from './mock-translations';

/**
 * Simple i18n render options for testing
 */
export interface SimpleI18nRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  language?: SupportedLanguages;
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

/**
 * Creates a simple mock i18n instance for testing
 */
export const createSimpleI18nInstance = (language: SupportedLanguages = 'en') => {
  const mockI18n = {
    language,
    isInitialized: true,
    changeLanguage: (_lng: string) => Promise.resolve(),
    t: (key: string, options?: any) => {
      const resources = getMockI18nResources();
      const translations = resources[language];
      
      // Simple key resolution
      const keyParts = key.split('.');
      let current: any = translations.common;
      
      for (const part of keyParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return key;
        }
      }
      
      if (typeof current !== 'string') {
        return key;
      }
      
      let result = current;
      
      // Handle interpolation
      if (options?.replace) {
        Object.entries(options.replace).forEach(([placeholder, value]) => {
          result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
        });
      }
      
      return result;
    },
    exists: () => true,
  };
  
  return mockI18n;
};

/**
 * Simple I18n Provider wrapper for testing
 */
export const SimpleI18nProvider: React.FC<{
  children: ReactNode;
  language?: SupportedLanguages;
}> = ({ children, language = 'en' }) => {
  const mockI18n = createSimpleI18nInstance(language);
  
  return (
    <I18nextProvider i18n={mockI18n as any}>
      {children}
    </I18nextProvider>
  );
};

/**
 * Simple render function for i18n testing
 */
export const renderWithSimpleI18n = (
  ui: ReactElement,
  options: SimpleI18nRenderOptions = {}
): RenderResult => {
  const { language = 'en', wrapper, ...renderOptions } = options;
  
  const I18nWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const content = (
      <SimpleI18nProvider language={language}>
        {children}
      </SimpleI18nProvider>
    );
    
    return wrapper ? React.createElement(wrapper, { children: content }) : content;
  };
  
  return render(ui, {
    wrapper: I18nWrapper,
    ...renderOptions,
  });
};

/**
 * Render in both languages for comparison
 */
export const renderSimpleBilingual = (
  ui: ReactElement,
  options: Omit<SimpleI18nRenderOptions, 'language'> = {}
) => {
  const english = renderWithSimpleI18n(ui, { ...options, language: 'en' });
  const french = renderWithSimpleI18n(ui, { ...options, language: 'fr-CA' });
  
  return { english, french };
};

/**
 * Simple mock useTranslation hook
 */
export const createMockUseTranslation = (language: SupportedLanguages = 'en') => {
  const mockI18n = createSimpleI18nInstance(language);
  
  return {
    t: mockI18n.t,
    i18n: mockI18n,
    ready: true,
  };
};
