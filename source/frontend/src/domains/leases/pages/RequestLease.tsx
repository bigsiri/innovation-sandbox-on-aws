// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { ReviewTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ReviewTemplate";
import { SelectLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/SelectLeaseTemplate";
import { TermsOfService } from "@amzn/innovation-sandbox-frontend/domains/leases/components/TermsOfService";
import { useRequestNewLease } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { NewLeaseRequest } from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

export const RequestLease = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const { t } = useTranslation(['leases', 'common']);

  const { mutateAsync: requestNewLease, isPending: isSubmitting } =
    useRequestNewLease();

  useInit(() => {
    setBreadcrumb([
      { text: t('common:home'), href: "/" },
      { text: t('request.title'), href: "/request" },
    ]);
  });

  const onSubmit = async (data: unknown) => {
    const formData = data as NewLeaseRequest;

    const request = {
      leaseTemplateUuid: formData.leaseTemplateUuid,
      comments: formData.comments,
    } as NewLeaseRequest;

    await requestNewLease(request);
    navigate("/");
    showSuccessToast(t('request.successMessage'));
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <>
      <Form
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
        schema={{
          header: t('request.title'),
          description: t('request.description'),
          fields: [
            {
              component: componentTypes.WIZARD,
              name: "wizard",
              allowSkipTo: true,
              i18nStrings: {
                submitButtonText: t('request.buttons.submit'),
                cancelButtonText: t('common:cancel'),
                previousButtonText: t('request.buttons.previous'),
                nextButtonText: t('request.buttons.next'),
                stepNumberText: t('request.stepNumberText'),
              },
              fields: [
                {
                  name: "lease-template",
                  title: t('request.steps.selectTemplate'),
                  fields: [
                    {
                      component: componentTypes.CUSTOM,
                      label: t('request.templateQuestion'),
                      CustomComponent: SelectLeaseTemplate,
                      isRequired: true,
                      name: "leaseTemplateUuid",
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: t('request.validation.selectTemplate'),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "terms",
                  title: t('request.steps.termsOfService'),
                  fields: [
                    {
                      component: componentTypes.PLAIN_TEXT,
                      name: "terms",
                      label: <TermsOfService />,
                    },
                    {
                      component: componentTypes.CHECKBOX,
                      name: "acceptTerms",
                      label: t('request.acceptTerms'),
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: t('request.validation.acceptTerms'),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "review",
                  title: t('request.steps.reviewSubmit'),
                  fields: [
                    {
                      component: componentTypes.REVIEW,
                      name: "review",
                      Template: ReviewTemplate,
                    },
                    {
                      component: componentTypes.TEXTAREA,
                      name: "comments",
                      label: t('request.comments.label'),
                      description: t('request.comments.description'),
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    </>
  );
};
