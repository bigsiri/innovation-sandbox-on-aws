// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';
import 'moment/locale/fr';
import i18n from '@amzn/innovation-sandbox-frontend/i18n';

export const getLocalizedMoment = () => {
  const currentLang = i18n.language;
  if (currentLang === 'fr-CA') {
    moment.locale('fr');
  } else {
    moment.locale('en');
  }
  return moment;
};
