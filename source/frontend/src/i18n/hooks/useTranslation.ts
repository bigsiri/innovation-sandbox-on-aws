// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { SupportedLanguages } from '../types';

export const useTranslation = (namespaces?: string | string[]) => {
  const { t, i18n, ...rest } = useI18nTranslation(namespaces);
  
  const currentLanguage = i18n.language as SupportedLanguages;
  
  return {
    t,
    i18n,
    currentLanguage,
    ...rest
  };
};
