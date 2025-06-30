// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes, validatorTypes } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";

import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { ReviewTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ReviewTemplate";
import { SelectLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leases/components/SelectLeaseTemplate";
import { TermsOfService } from "@amzn/innovation-sandbox-frontend/domains/leases/components/TermsOfService";
import { useRequestNewLease } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { NewLeaseRequest } from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const RequestLease = () => {
  const { t } = useTranslation('leases');

  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();

  const { mutateAsync: requestNewLease, isPending: isSubmitting } =
    useRequestNewLease();

  useInit(() => {
    setBreadcrumb([
      { text: t('breadcrumbs.home'), href: "/" },
      { text: t('breadcrumbs.request'), href: "/request" },
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
    showSuccessToast(t('forms.request.success'));
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
          header: t('forms.request.title'),
          description: t('forms.request.description'),
          fields: [
            {
              component: componentTypes.WIZARD,
              name: "wizard",
              allowSkipTo: true,
              i18nStrings: {
                stepNumberLabel: (stepNumber: number) => t('wizard.step', { ns: 'common', replace: { number: stepNumber } })
              },
              fields: [
                {
                  name: "lease-template",
                  title: t('forms.request.selectTemplate.title', { ns: 'leases' }),
                  fields: [
                    {
                      component: componentTypes.CUSTOM,
                      label: t('forms.request.selectTemplate.label', { ns: 'leases' }),
                      CustomComponent: SelectLeaseTemplate,
                      isRequired: true,
                      name: "leaseTemplateUuid",
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: t('forms.request.selectTemplate.validation', { ns: 'leases' }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "terms",
                  title: t('forms.request.termsOfService.title', { ns: 'leases' }),
                  fields: [
                    {
                      component: componentTypes.PLAIN_TEXT,
                      name: "terms",
                      label: <TermsOfService />,
                    },
                    {
                      component: componentTypes.CHECKBOX,
                      name: "acceptTerms",
                      label: t('forms.request.termsOfService.acceptLabel', { ns: 'leases' }),
                      validate: [
                        {
                          type: validatorTypes.REQUIRED,
                          message: t('forms.request.termsOfService.validation', { ns: 'leases' }),
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "review",
                  title: t('forms.request.review.title', { ns: 'leases' }),
                  fields: [
                    {
                      component: componentTypes.REVIEW,
                      name: "review",
                      Template: ReviewTemplate,
                    },
                    {
                      component: componentTypes.TEXTAREA,
                      name: "comments",
                      label: t('forms.request.review.comments.label', { ns: 'leases' }),
                      description: t('forms.request.review.comments.description', { ns: 'leases' }),
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
