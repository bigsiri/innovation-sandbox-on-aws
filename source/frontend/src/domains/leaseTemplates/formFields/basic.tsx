// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { Alert, Box } from "@cloudscape-design/components";

export const basicFormFields = (t: any) => {
  return {
    name: "basic",
    title: t("basicDetails"),
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: "name",
        label: t("name"),
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
            message: t("nameRequired"),
          },
        ],
      },
      {
        component: componentTypes.TEXTAREA,
        name: "description",
        label: t("description"),
        description: t("optional"),
      },
      {
        component: componentTypes.SWITCH,
        name: "requiresApproval",
        label: t("approvalRequired"),
      },
      {
        component: componentTypes.SWITCH,
        name: "allowOwnerUserManagement",
        label: t("allowOwnerUserManagement"),
        description: t("allowOwnerUserManagementDescription"),
        initialValue: false,
      },
      {
        component: componentTypes.PLAIN_TEXT,
        name: "warning",
        label: (
          <Box data-inline-block>
            <Alert type="warning">
              {t("automaticAccountWarning")}
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
  };
};
