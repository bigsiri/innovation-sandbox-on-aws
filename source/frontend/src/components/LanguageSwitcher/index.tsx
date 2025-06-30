// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Select, SelectProps, Box, StatusIndicator } from '@cloudscape-design/components';

import { useTranslation } from '../../i18n/hooks/useTranslation';
import { SupportedLanguages } from '../../i18n/types';
import { 
  LanguageSwitcherProps, 
  LanguageOption, 
  DEFAULT_LANGUAGE_OPTIONS,
} from './types';

/**
 * Enhanced language switcher component with smooth transitions and accessibility
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  disabled = false,
  compact = false,
  ariaLabel,
  onLanguageChange,
  loading: externalLoading = false,
  testId = 'language-switcher',
  showConfirmation = true,
}) => {
  const { t, currentLanguage, changeLanguage, isLoading: translationLoading } = useTranslation();
  const [internalLoading, setInternalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine external and internal loading states
  const isLoading = externalLoading || translationLoading || internalLoading;

  // Get localized language options with both English and French names
  const languageOptions = useMemo((): LanguageOption[] => {
    return DEFAULT_LANGUAGE_OPTIONS.map(option => {
      const englishName = option.value === 'en' ? 'English' : 'French (Canada)';
      const frenchName = option.value === 'en' ? 'Anglais' : 'Français (Canada)';
      
      return {
        ...option,
        label: `${englishName} / ${frenchName}`,
        displayLabel: option.value === 'en' 
          ? t('languageSwitcher.english', { ns: 'common' })
          : t('languageSwitcher.frenchCanadian', { ns: 'common' }),
      };
    });
  }, [t]);

  // Convert language options to CloudScape Select options
  const selectOptions = useMemo((): SelectProps.Option[] => {
    return languageOptions.map(option => ({
      value: option.value,
      label: compact ? `${option.flag} ${option.value.toUpperCase()}` : `${option.flag} ${option.displayLabel}`,
      description: compact ? option.displayLabel : option.label,
      disabled: option.disabled,
    }));
  }, [languageOptions, compact]);

  // Find currently selected option
  const selectedOption = useMemo((): SelectProps.Option | null => {
    return selectOptions.find(option => option.value === currentLanguage) || null;
  }, [selectOptions, currentLanguage]);

  // Clear success message after delay
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Clear error after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle language selection change with enhanced error handling
  const handleLanguageChange = useCallback(async (detail: SelectProps.ChangeDetail) => {
    const newLanguage = detail.selectedOption.value as SupportedLanguages;
    
    if (newLanguage === currentLanguage) {
      return; // No change needed
    }

    setInternalLoading(true);
    setError(null);

    try {
      // Change the language - i18next will handle localStorage persistence
      await changeLanguage(newLanguage);
      
      // Call external callback if provided
      onLanguageChange?.(newLanguage);
      
      // Show success confirmation if enabled
      if (showConfirmation) {
        setShowSuccess(true);
      }
      
      // Announce the change for screen readers
      const languageName = languageOptions.find(opt => opt.value === newLanguage)?.displayLabel || newLanguage;
      const announcement = t('languageSwitcher.languageChanged', { 
        replace: { language: languageName },
        ns: 'common'
      });
      
      // Create a temporary element for screen reader announcement
      const announcementElement = document.createElement('div');
      announcementElement.setAttribute('aria-live', 'polite');
      announcementElement.setAttribute('aria-atomic', 'true');
      announcementElement.style.position = 'absolute';
      announcementElement.style.left = '-10000px';
      announcementElement.style.width = '1px';
      announcementElement.style.height = '1px';
      announcementElement.style.overflow = 'hidden';
      announcementElement.textContent = announcement;
      
      document.body.appendChild(announcementElement);
      setTimeout(() => {
        if (document.body.contains(announcementElement)) {
          document.body.removeChild(announcementElement);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Failed to change language:', err);
      const errorMessage = t('languageSwitcher.error', { 
        defaultValue: 'Failed to change language. Please try again.',
        ns: 'common'
      });
      setError(errorMessage);
    } finally {
      setInternalLoading(false);
    }
  }, [currentLanguage, changeLanguage, onLanguageChange, languageOptions, t, showConfirmation]);

  // Get aria-label with fallback
  const effectiveAriaLabel = ariaLabel || t('languageSwitcher.ariaLabel', { ns: 'common' });

  return (
    <Box>
      <Select
        className={className}
        selectedOption={selectedOption}
        onChange={({ detail }) => handleLanguageChange(detail)}
        options={selectOptions}
        disabled={disabled || isLoading}
        ariaLabel={effectiveAriaLabel}
        data-testid={testId}
        placeholder={isLoading ? t('languageSwitcher.switchingLanguage', { ns: 'common' }) : undefined}
        // CloudScape Select specific props
        expandToViewport={true}
        filteringType="none"
        // Accessibility enhancements
        ariaDescribedby={compact ? `${testId}-description` : undefined}
      />
      
      {/* Success confirmation */}
      {showSuccess && showConfirmation && (
        <Box margin={{ top: 'xs' }}>
          <StatusIndicator type="success">
            {t('languageSwitcher.languageChanged', { 
              replace: { language: selectedOption?.label || currentLanguage },
              ns: 'common'
            })}
          </StatusIndicator>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Box margin={{ top: 'xs' }}>
          <StatusIndicator type="error">
            {error}
          </StatusIndicator>
        </Box>
      )}
    </Box>
  );
};

export default LanguageSwitcher;
