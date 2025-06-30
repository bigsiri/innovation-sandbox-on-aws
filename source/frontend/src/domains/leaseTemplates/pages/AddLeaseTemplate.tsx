// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { componentTypes } from "@aws-northstar/ui";
import { useNavigate } from "react-router-dom";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Form } from "@amzn/innovation-sandbox-frontend/components/Form";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { basicFormFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/basic";
import { budgetFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/budget";
import { durationFields } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/formFields/duration";
import { useAddLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import {
  LeaseTemplateFormData,
  NewLeaseTemplate,
} from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/types";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";

export const AddLeaseTemplate = () => {
  const { t } = useTranslation('leaseTemplates');
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();

  const { mutateAsync: addLeaseTemplate, isPending: isSaving } =
    useAddLeaseTemplate();

  // get global settings
  const {
    data: config,
    isLoading: isLoadingConfig,
    isError: isConfigError,
    refetch: refetchConfig,
    error,
  } = useGetConfigurations();

  useInit(() => {
    setBreadcrumb([
      { text: t('breadcrumbs.home', { ns: 'navigation' }), href: "/" },
      { text: t('breadcrumbs.leaseTemplates', { ns: 'navigation' }), href: "/lease_templates" },
      { text: t('page.addTitle', { ns: 'leaseTemplates' }), href: "/lease_templates/new" },
    ]);
  });

  const onSubmit = async (data: any) => {
    const {
      maxBudgetEnabled,
      maxSpend,
      maxDurationEnabled,
      leaseDurationInHours,
      ...rest
    } = data as LeaseTemplateFormData;

    const leaseTemplate: NewLeaseTemplate = {
      ...rest,
      maxSpend: maxBudgetEnabled ? maxSpend : undefined,
      leaseDurationInHours: maxDurationEnabled
        ? leaseDurationInHours
        : undefined,
    };

    await addLeaseTemplate(leaseTemplate);
    showSuccessToast(t('page.addSuccess', { ns: 'leaseTemplates' }));
    navigate("/lease_templates");
  };

  const onCancel = () => {
    navigate("/lease_templates");
  };

  if (isLoadingConfig) {
    return <Loader label={t('page.loadingConfig', { ns: 'leaseTemplates' })} />;
  }

  if (isConfigError) {
    return (
      <ErrorPanel
        description={t('page.configError', { ns: 'leaseTemplates' })}
        retry={refetchConfig}
        error={error as Error}
      />
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSaving}
      initialValues={{
        requiresApproval: true,
        maxBudgetEnabled: true,
        maxDurationEnabled: true,
      }}
      schema={{
        header: t('page.addTitle', { ns: 'leaseTemplates' }),
        description: t('page.addDescription', { ns: 'leaseTemplates' }),
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
                ...basicFormFields(),
                title: basicFormFields().title
              },
              {
                ...budgetFields({ globalMaxBudget: config?.leases.maxBudget }),
                title: budgetFields({ globalMaxBudget: config?.leases.maxBudget }).title
              },
              {
                ...durationFields({
                  globalMaxDuration: config?.leases.maxDurationHours,
                  t,
                }),
                title: durationFields({ globalMaxDuration: config?.leases.maxDurationHours, t }).title
              },
            ],
          },
        ],
      }}
    />
  );
};
