// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Select, SelectProps } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common');

  const languageOptions: SelectProps.Option[] = [
    { label: t('english'), value: 'en' },
    { label: t('french'), value: 'fr-CA' },
  ];

  const selectedOption = languageOptions.find(option => option.value === i18n.language) || languageOptions[0];

  const handleLanguageChange = (detail: SelectProps.ChangeDetail) => {
    if (detail.selectedOption.value) {
      i18n.changeLanguage(detail.selectedOption.value);
    }
  };

  return (
    <Select
      selectedOption={selectedOption}
      onChange={({ detail }) => handleLanguageChange(detail)}
      options={languageOptions}
      placeholder={t('language')}
      ariaLabel={t('language')}
    />
  );
};
