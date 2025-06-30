// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
  Container, 
  Header, 
  SpaceBetween, 
  FormField,
  Box,
  Alert
} from "@cloudscape-design/components";

import { LanguageSwitcher } from "@amzn/innovation-sandbox-frontend/components/LanguageSwitcher";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { SupportedLanguages } from "@amzn/innovation-sandbox-frontend/i18n/types";

export const UserPreferences = () => {
  const { t, currentLanguage } = useTranslation();

  const handleLanguageChange = (newLanguage: SupportedLanguages) => {
    // Language change is handled by the LanguageSwitcher component
    console.log(`Language preference changed to: ${newLanguage}`);
  };

  return (
    <Container
      header={
        <Header variant="h2">
          {t('userPreferences.title', { ns: 'settings' })}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Alert type="info">
          {t('userPreferences.description', { ns: 'settings' })}
        </Alert>
        
        <FormField
          label={t('userPreferences.language.label', { ns: 'settings' })}
          description={t('userPreferences.language.description', { ns: 'settings' })}
        >
          <div style={{ maxWidth: '300px' }}>
            <LanguageSwitcher
              onLanguageChange={handleLanguageChange}
              showConfirmation={true}
              ariaLabel={t('userPreferences.language.ariaLabel', { ns: 'settings' })}
            />
          </div>
        </FormField>

        <Box>
          <Box variant="small" color="text-status-info">
            {t('userPreferences.currentLanguage', { 
              replace: { language: currentLanguage === 'en' ? 'English' : 'Français (Canada)' },
              ns: 'settings' 
            })}
          </Box>
        </Box>
      </SpaceBetween>
    </Container>
  );
};
