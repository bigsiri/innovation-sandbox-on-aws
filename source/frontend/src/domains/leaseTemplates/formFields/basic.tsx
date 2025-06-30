// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, Box } from "@cloudscape-design/components";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

export const basicFormFields = (t?: TranslationFunction) => ({
  name: "basic",
  title: t ? t('forms.basic.title', { ns: 'leaseTemplates' }) : "Basic Details",
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: "name",
      label: t ? t('forms.basic.name.label', { ns: 'leaseTemplates' }) : "Name",
      isRequired: true,
      validate: [
        {
          type: validatorTypes.REQUIRED,
          message: t ? t('forms.basic.name.required', { ns: 'leaseTemplates' }) : "Name is required",
        },
      ],
    },
    {
      component: componentTypes.TEXTAREA,
      name: "description",
      label: t ? t('forms.basic.description.label', { ns: 'leaseTemplates' }) : "Description",
      description: t ? t('forms.basic.description.description', { ns: 'leaseTemplates' }) : "Optional description for this lease template",
    },
    {
      component: componentTypes.SWITCH,
      name: "requiresApproval",
      label: t ? t('forms.basic.approval.label', { ns: 'leaseTemplates' }) : "Requires Approval",
    },
    {
      component: componentTypes.PLAIN_TEXT,
      name: "warning",
      label: (
        <Box data-inline-block>
          <Alert type="warning">
            Auto-provisioning is enabled. Leases will be created immediately without approval.
          </Alert>
        </Box>
      ),
      condition: {
        not: {
          when: "requiresApproval",
          is: true,
        },
        then: {
          visible: true,
        },
      },
    },
  ],
});
