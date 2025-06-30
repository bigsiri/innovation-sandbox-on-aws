// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
  SupportedLanguages, 
  TranslationNamespaces, 
  TranslationValidationResult 
} from '../types';
import { SUPPORTED_LANGUAGES, NAMESPACES } from '../index';

/**
 * Flatten nested translation object to dot notation keys
 */
const flattenTranslationKeys = (
  obj: Record<string, any>, 
  prefix: string = ''
): string[] => {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenTranslationKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

/**
 * Load translation resource for a specific language and namespace
 */
const loadTranslationResource = async (
  language: SupportedLanguages,
  namespace: TranslationNamespaces
): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch(`/locales/${language}/${namespace}.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load translation resource: ${language}/${namespace}`, error);
    return null;
  }
};

/**
 * Validate that a translation key exists in the specified namespace and language
 */
export const validateTranslationKey = async (
  key: string,
  namespace: TranslationNamespaces = 'common',
  language: SupportedLanguages = 'en'
): Promise<boolean> => {
  try {
    const resource = await loadTranslationResource(language, namespace);
    if (!resource) {
      return false;
    }
    
    // Navigate through nested object using dot notation
    const keyParts = key.split('.');
    let current = resource;
    
    for (const part of keyParts) {
      if (typeof current !== 'object' || current === null || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    // Check if the final value is a string (valid translation)
    return typeof current === 'string' && (current as string).trim() !== '';
  } catch (error) {
    console.error(`Error validating translation key "${key}":`, error);
    return false;
  }
};

/**
 * Check for missing translations by comparing two language resources
 */
export const findMissingTranslations = async (
  namespace: TranslationNamespaces,
  sourceLanguage: SupportedLanguages = 'en',
  targetLanguage: SupportedLanguages = 'fr-CA'
): Promise<TranslationValidationResult> => {
  try {
    const [sourceResource, targetResource] = await Promise.all([
      loadTranslationResource(sourceLanguage, namespace),
      loadTranslationResource(targetLanguage, namespace)
    ]);
    
    if (!sourceResource || !targetResource) {
      return {
        isValid: false,
        missingKeys: [],
        extraKeys: [],
        emptyValues: [],
        namespace,
        language: targetLanguage,
      };
    }
    
    const sourceKeys = flattenTranslationKeys(sourceResource);
    const targetKeys = flattenTranslationKeys(targetResource);
    
    // Find missing keys (in source but not in target)
    const missingKeys = sourceKeys.filter(key => !targetKeys.includes(key));
    
    // Find extra keys (in target but not in source)
    const extraKeys = targetKeys.filter(key => !sourceKeys.includes(key));
    
    // Find empty values in target
    const emptyValues: string[] = [];
    for (const key of targetKeys) {
      const keyParts = key.split('.');
      let current = targetResource;
      
      for (const part of keyParts) {
        current = current[part];
      }
      
      if (typeof current === 'string' && (current as string).trim() === '') {
        emptyValues.push(key);
      }
    }
    
    const isValid = missingKeys.length === 0 && emptyValues.length === 0;
    
    return {
      isValid,
      missingKeys,
      extraKeys,
      emptyValues,
      namespace,
      language: targetLanguage,
    };
  } catch (error) {
    console.error(`Error finding missing translations for ${namespace}:`, error);
    return {
      isValid: false,
      missingKeys: [],
      extraKeys: [],
      emptyValues: [],
      namespace,
      language: targetLanguage,
    };
  }
};

/**
 * Validate all translation resources for consistency
 */
export const validateAllTranslations = async (): Promise<TranslationValidationResult[]> => {
  const results: TranslationValidationResult[] = [];
  
  for (const namespace of NAMESPACES) {
    for (const language of SUPPORTED_LANGUAGES) {
      if (language !== 'en') { // Skip English as it's the source
        const result = await findMissingTranslations(namespace, 'en', language);
        results.push(result);
      }
    }
  }
  
  return results;
};

/**
 * Development-mode warning for missing translations
 */
export const warnMissingTranslation = (
  key: string,
  namespace: TranslationNamespaces = 'common',
  language: SupportedLanguages = 'en'
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `🌐 Missing translation: "${key}" in namespace "${namespace}" for language "${language}"`
    );
    
    // Store missing keys for batch reporting
    if (typeof window !== 'undefined') {
      const storageKey = 'missing-translations';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const entry = { key, namespace, language, timestamp: Date.now() };
      
      // Avoid duplicates
      const isDuplicate = existing.some((item: any) => 
        item.key === key && item.namespace === namespace && item.language === language
      );
      
      if (!isDuplicate) {
        existing.push(entry);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
    }
  }
};

/**
 * Get all missing translations stored during development
 */
export const getMissingTranslations = (): Array<{
  key: string;
  namespace: TranslationNamespaces;
  language: SupportedLanguages;
  timestamp: number;
}> => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const storageKey = 'missing-translations';
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving missing translations:', error);
    return [];
  }
};

/**
 * Clear stored missing translations
 */
export const clearMissingTranslations = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('missing-translations');
  }
};

/**
 * Generate a report of missing translations
 */
export const generateMissingTranslationsReport = (): string => {
  const missing = getMissingTranslations();
  
  if (missing.length === 0) {
    return 'No missing translations found.';
  }
  
  const grouped = missing.reduce((acc, item) => {
    const key = `${item.language}:${item.namespace}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item.key);
    return acc;
  }, {} as Record<string, string[]>);
  
  let report = '# Missing Translations Report\n\n';
  
  for (const [groupKey, keys] of Object.entries(grouped)) {
    const [language, namespace] = groupKey.split(':');
    report += `## ${language.toUpperCase()} - ${namespace}\n\n`;
    
    for (const key of keys) {
      report += `- \`${key}\`\n`;
    }
    
    report += '\n';
  }
  
  return report;
};

/**
 * Validate translation interpolation variables
 */
export const validateTranslationInterpolation = (
  translationValue: string,
  expectedVariables: string[] = []
): {
  isValid: boolean;
  missingVariables: string[];
  extraVariables: string[];
} => {
  // Find all interpolation variables in the translation ({{variable}})
  const interpolationRegex = /\{\{([^}]+)\}\}/g;
  const foundVariables: string[] = [];
  let match;
  
  while ((match = interpolationRegex.exec(translationValue)) !== null) {
    foundVariables.push(match[1].trim());
  }
  
  const missingVariables = expectedVariables.filter(
    variable => !foundVariables.includes(variable)
  );
  
  const extraVariables = foundVariables.filter(
    variable => !expectedVariables.includes(variable)
  );
  
  return {
    isValid: missingVariables.length === 0 && extraVariables.length === 0,
    missingVariables,
    extraVariables,
  };
};

/**
 * Check if a translation contains potentially problematic content
 */
export const validateTranslationContent = (
  translationValue: string
): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for empty or whitespace-only content
  if (!translationValue || translationValue.trim() === '') {
    issues.push('Translation is empty or contains only whitespace');
  }
  
  // Check for unmatched HTML tags
  const htmlTagRegex = /<\/?[^>]+>/g;
  const tags = translationValue.match(htmlTagRegex) || [];
  const openTags: string[] = [];
  
  for (const tag of tags) {
    if (tag.startsWith('</')) {
      // Closing tag
      const tagName = tag.slice(2, -1);
      const lastOpenTag = openTags.pop();
      if (lastOpenTag !== tagName) {
        issues.push(`Unmatched HTML tag: ${tag}`);
      }
    } else if (!tag.endsWith('/>')) {
      // Opening tag (not self-closing)
      const tagName = tag.slice(1, -1).split(' ')[0];
      openTags.push(tagName);
    }
  }
  
  if (openTags.length > 0) {
    issues.push(`Unclosed HTML tags: ${openTags.join(', ')}`);
  }
  
  // Check for unmatched interpolation brackets
  const openBrackets = (translationValue.match(/\{\{/g) || []).length;
  const closeBrackets = (translationValue.match(/\}\}/g) || []).length;
  
  if (openBrackets !== closeBrackets) {
    issues.push('Unmatched interpolation brackets');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};
