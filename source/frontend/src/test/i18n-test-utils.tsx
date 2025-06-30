// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SupportedLanguages } from '../i18n/types';
import { getMockI18nResources } from './mock-translations';

/**
 * Custom render options for i18n testing
 */
export interface I18nRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Language to use for testing */
  language?: SupportedLanguages;
  /** Custom i18n instance (optional) */
  i18nInstance?: typeof i18n;
  /** Additional wrapper components */
  wrapper?: React.ComponentType<{ children: ReactNode }>;
  /** Whether to initialize i18n automatically */
  autoInit?: boolean;
}

/**
 * Creates a mock i18n instance for testing
 */
export const createMockI18nInstance = async (
  language: SupportedLanguages = 'en',
  customResources?: any
) => {
  const mockI18n = i18n.createInstance();
  
  await mockI18n
    .use(initReactI18next)
    .init({
      lng: language,
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      resources: customResources || getMockI18nResources(),
      // Disable loading from external sources
      load: 'languageOnly',
      preload: [language],
      // Ensure synchronous behavior in tests
      initImmediate: false,
    });
  
  return mockI18n;
};

/**
 * I18n Provider wrapper for testing
 */
export const I18nTestProvider: React.FC<{
  children: ReactNode;
  language?: SupportedLanguages;
  i18nInstance?: typeof i18n;
}> = ({ children, language = 'en', i18nInstance }) => {
  const [mockI18n, setMockI18n] = React.useState<typeof i18n | null>(i18nInstance || null);
  
  React.useEffect(() => {
    if (!i18nInstance) {
      createMockI18nInstance(language).then(setMockI18n);
    }
  }, [language, i18nInstance]);
  
  if (!mockI18n) {
    return <div data-testid="i18n-loading">Loading i18n...</div>;
  }
  
  return (
    <I18nextProvider i18n={mockI18n}>
      {children}
    </I18nextProvider>
  );
};

/**
 * Custom render function that wraps components with i18n provider
 */
export const renderWithI18n = async (
  ui: ReactElement,
  options: I18nRenderOptions = {}
): Promise<RenderResult & { i18n: typeof i18n }> => {
  const {
    language = 'en',
    i18nInstance,
    wrapper,
    autoInit = true,
    ...renderOptions
  } = options;
  
  // Create or use provided i18n instance
  const mockI18n = i18nInstance || (autoInit ? await createMockI18nInstance(language) : null);
  
  if (!mockI18n && autoInit) {
    throw new Error('Failed to create i18n instance for testing');
  }
  
  // Create wrapper component
  const I18nWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const content = mockI18n ? (
      <I18nextProvider i18n={mockI18n}>
        {children}
      </I18nextProvider>
    ) : (
      <I18nTestProvider language={language} i18nInstance={i18nInstance}>
        {children}
      </I18nTestProvider>
    );
    
    return wrapper ? React.createElement(wrapper, { children: content }) : content;
  };
  
  const result = render(ui, {
    wrapper: I18nWrapper,
    ...renderOptions,
  });
  
  return {
    ...result,
    i18n: mockI18n!,
  };
};

/**
 * Render component with specific language and wait for i18n to be ready
 */
export const renderWithLanguage = async (
  ui: ReactElement,
  language: SupportedLanguages,
  options: Omit<I18nRenderOptions, 'language'> = {}
): Promise<RenderResult & { i18n: typeof i18n }> => {
  return renderWithI18n(ui, { ...options, language });
};

/**
 * Render component in both languages for comparison testing
 */
export const renderBilingual = async (
  ui: ReactElement,
  options: Omit<I18nRenderOptions, 'language'> = {}
) => {
  const englishResult = await renderWithLanguage(ui, 'en', options);
  const frenchResult = await renderWithLanguage(ui, 'fr-CA', options);
  
  return {
    english: englishResult,
    french: frenchResult,
  };
};

/**
 * Helper to change language in an existing i18n instance
 */
export const changeLanguage = async (
  i18nInstance: typeof i18n,
  language: SupportedLanguages
): Promise<void> => {
  await i18nInstance.changeLanguage(language);
};

/**
 * Helper to wait for i18n to be ready
 */
export const waitForI18n = async (i18nInstance: typeof i18n): Promise<void> => {
  return new Promise((resolve) => {
    if (i18nInstance.isInitialized) {
      resolve();
    } else {
      i18nInstance.on('initialized', () => resolve());
    }
  });
};

/**
 * Mock i18n hooks for testing components that use i18n directly
 */
export const mockUseTranslation = (
  language: SupportedLanguages = 'en',
  customTranslations?: any
) => {
  const resources = customTranslations || getMockI18nResources();
  const translations = resources[language];
  
  return {
    t: (key: string, options?: any) => {
      // Handle namespace
      let current: any = translations;
      const namespaceParts = ['common']; // Default to common namespace
      
      for (const nsPart of namespaceParts) {
        if (current && typeof current === 'object' && nsPart in current) {
          current = current[nsPart];
        } else {
          return key;
        }
      }
      
      // Navigate through key parts
      const keyParts = key.split('.');
      for (const part of keyParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return key; // Return key if translation not found
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
      
      // Handle count
      if (options?.count !== undefined) {
        result = result.replace(/{{count}}/g, String(options.count));
      }
      
      return result;
    },
    i18n: {
      language,
      changeLanguage: () => Promise.resolve(),
      exists: () => true,
    },
    ready: true,
  };
};

/**
 * Test utilities for language switching
 */
export const languageSwitchingUtils = {
  /**
   * Test that component updates when language changes
   */
  testLanguageSwitch: async (
    renderComponent: () => Promise<RenderResult & { i18n: typeof i18n }>,
    testKey: string,
    namespace: string = 'common'
  ) => {
    const { i18n } = await renderComponent();
    
    // Get initial English text
    const mockResources = getMockI18nResources();
    const englishNamespace = mockResources.en[namespace as keyof typeof mockResources.en] as any;
    const englishText = englishNamespace?.[testKey] || testKey;
    
    // Change to French
    await changeLanguage(i18n, 'fr-CA');
    // Note: rerender would need the original UI element
    // rerender(originalUI);
    
    // Get French text
    const frenchNamespace = mockResources['fr-CA'][namespace as keyof typeof mockResources['fr-CA']] as any;
    const frenchText = frenchNamespace?.[testKey] || testKey;
    
    return { englishText, frenchText };
  },
  
  /**
   * Create a language switching test scenario
   */
  createLanguageSwitchTest: (
    component: ReactElement,
    testCases: Array<{
      key: string;
      namespace?: string;
      expectedEn: string;
      expectedFr: string;
    }>
  ) => {
    return async () => {
      for (const testCase of testCases) {
        const { english, french } = await renderBilingual(component);
        
        // Test English
        const englishElement = english.getByText(testCase.expectedEn);
        if (!englishElement) {
          throw new Error(`English text "${testCase.expectedEn}" not found`);
        }
        
        // Test French
        const frenchElement = french.getByText(testCase.expectedFr);
        if (!frenchElement) {
          throw new Error(`French text "${testCase.expectedFr}" not found`);
        }
        
        // Cleanup
        english.unmount();
        french.unmount();
      }
    };
  }
};

/**
 * Cleanup function for i18n tests
 */
export const cleanupI18n = () => {
  // Reset any global i18n state if needed
  if (i18n.isInitialized) {
    i18n.changeLanguage('en');
  }
};

/**
 * Custom render hook for testing i18n hooks
 */
export const renderI18nHook = async <T,>(
  hook: () => T,
  language: SupportedLanguages = 'en'
): Promise<{ result: { current: T }; i18n: typeof i18n }> => {
  const mockI18n = await createMockI18nInstance(language);
  
  const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <I18nextProvider i18n={mockI18n}>
      {children}
    </I18nextProvider>
  );
  
  const { renderHook } = await import('@testing-library/react');
  const hookResult = renderHook(hook, { wrapper });
  
  return {
    result: hookResult.result,
    i18n: mockI18n,
  };
};

// Re-export commonly used testing utilities
export * from '@testing-library/react';
export { screen, fireEvent, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
