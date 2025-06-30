// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ContentLayout, Header, Alert, SpaceBetween, Tabs } from "@cloudscape-design/components";
import { useGetLeaseTemplateById, useUpdateLeaseTemplate } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { BasicDetailsForm } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/components/BasicDetailsForm";
import { BudgetForm, BudgetFormData } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/components/BudgetForm";
import { DurationForm, DurationFormData } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/components/DurationForm";
import { generateBreadcrumb } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/helpers";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const UpdateLeaseTemplate = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const setBreadcrumb = useBreadcrumb();
  const { t } = useTranslation();
  
  const leaseTemplateQuery = useGetLeaseTemplateById(uuid!);
  const { data: leaseTemplate, isLoading, isError, error, refetch } = leaseTemplateQuery;
  const { data: config, isLoading: isLoadingConfig, isError: isConfigError, error: configError, refetch: refetchConfig } = useGetConfigurations();
  const { mutate: updateLeaseTemplate, isPending: isUpdating } = useUpdateLeaseTemplate();

  const onUpdateBudget = (data: BudgetFormData) => {
    if (!leaseTemplate) return;
    updateLeaseTemplate({
      ...leaseTemplate,
      maxSpend: data.maxSpend,
      budgetThresholds: data.budgetThresholds,
    });
  };

  const onUpdateDuration = (data: DurationFormData) => {
    if (!leaseTemplate) return;
    updateLeaseTemplate({
      ...leaseTemplate,
      leaseDurationInHours: data.leaseDurationInHours,
      durationThresholds: data.durationThresholds,
    });
  };

  const onCancel = () => {
    navigate("/lease_templates");
  };

  useEffect(() => {
    setBreadcrumb(generateBreadcrumb(leaseTemplateQuery));
  }, [leaseTemplateQuery, setBreadcrumb]);

  if (isLoading || isLoadingConfig) {
    return <Loader />;
  }

  if (isError || !leaseTemplate) {
    return (
      <ErrorPanel
        description="There was a problem loading this lease template."
        retry={refetch}
        error={error as Error}
      />
    );
  }

  if (isConfigError) {
    return (
      <ErrorPanel
        description="There was a problem loading global configuration settings."
        retry={refetchConfig}
        error={configError as Error}
      />
    );
  }

  return (
    <ContentLayout
      header={
        <Header variant="h1" description={leaseTemplate.description}>
          {leaseTemplate.name}
        </Header>
      }
    >
      <SpaceBetween size="m">
        <Alert type="info" header={t('updateNotice.title', { ns: 'leaseTemplates' })}>
          {t('updateNotice.description', { ns: 'leaseTemplates' })}
        </Alert>
        <Tabs
          tabs={[
            {
              id: "basic",
              label: t('tabs.basicDetails', { ns: 'leaseTemplates' }),
              content: <BasicDetailsForm leaseTemplate={leaseTemplate} />,
            },
            {
              id: "budget",
              label: t('tabs.budget', { ns: 'leaseTemplates' }),
              content: (
                <BudgetForm
                  maxSpend={leaseTemplate.maxSpend}
                  budgetThresholds={leaseTemplate.budgetThresholds}
                  onSubmit={onUpdateBudget}
                  onCancel={onCancel}
                  isUpdating={isUpdating}
                  globalMaxBudget={config?.leases.maxBudget}
                />
              ),
            },
            {
              id: "duration",
              label: t('tabs.duration', { ns: 'leaseTemplates' }),
              content: (
                <DurationForm
                  leaseDurationInHours={leaseTemplate.leaseDurationInHours}
                  durationThresholds={leaseTemplate.durationThresholds}
                  onSubmit={onUpdateDuration}
                  onCancel={onCancel}
                  isUpdating={isUpdating}
                  globalMaxDuration={config?.leases.maxDurationHours}
                />
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
};
