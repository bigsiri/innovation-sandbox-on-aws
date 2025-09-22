// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SettingService } from "@amzn/innovation-sandbox-frontend/domains/settings/service";

const SUPPORTED_LANGUAGES = ['en', 'fr-CA'] as const;

export interface LanguageConfig {
  defaultLanguage: 'en' | 'fr-CA';
  enableBrowserDetection: boolean;
}

export const getLanguageConfig = async (): Promise<LanguageConfig> => {
  try {
    const settingsService = new SettingService();
    const config = await settingsService.getConfigurations();
    
    return {
      defaultLanguage: config.language?.defaultLanguage || 'en',
      enableBrowserDetection: config.language?.enableBrowserDetection ?? true,
    };
  } catch (error) {
    console.warn('Failed to load language configuration from AppConfig, using defaults:', error);
    return {
      defaultLanguage: 'en',
      enableBrowserDetection: true,
    };
  }
};

export const getSupportedLanguages = () => SUPPORTED_LANGUAGES;
