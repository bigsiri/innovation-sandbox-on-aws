// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { FieldInputProps } from "@aws-northstar/ui";
import {
  Alert,
  Box,
  Cards,
  ColumnLayout,
  Container,
  FormField,
  Input,
  Pagination,
  SpaceBetween,
  StatusIndicator,
} from "@cloudscape-design/components";
import { getLocalizedMoment } from "@amzn/innovation-sandbox-frontend/helpers/moment";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";
import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { useGetLeaseTemplates } from "@amzn/innovation-sandbox-frontend/domains/leaseTemplates/hooks";
import { formatCurrency } from "@amzn/innovation-sandbox-frontend/helpers/util";

interface SelectLeaseTemplateProps {
  input: FieldInputProps<HTMLInputElement>;
  data: Record<string, object>;
  label?: string;
  description?: string;
  showError: boolean;
  meta: {
    error: string | undefined;
  };
}

const LEASE_TEMPLATES_PER_PAGE = 12;
const LeaseTemplateCardContent = ({ option }: { option: LeaseTemplate }) => {
  const { t } = useTranslation('leases');
  const moment = getLocalizedMoment();
  
  return (
    <SpaceBetween size="l">
      <div>{option.description}</div>
      <Container>
        <SpaceBetween size="l">
          <ColumnLayout columns={3} minColumnWidth={150} variant="text-grid">
            <Box>
              <FormField data-nowrap label={t('request.template.maxBudget')} />
              {option.maxSpend ? (
                formatCurrency(option.maxSpend)
              ) : (
                <StatusIndicator type="info">{t('request.template.noMaxBudget')}</StatusIndicator>
              )}
            </Box>

            <Box>
              <FormField data-nowrap label={t('request.template.expires')} />
              {option.leaseDurationInHours ? (
                t('request.template.afterDuration', { duration: moment.duration(option.leaseDurationInHours, "hours").humanize() })
              ) : (
                <StatusIndicator type="info">{t('request.template.noExpiry')}</StatusIndicator>
              )}
            </Box>

            <Box>
              <FormField data-nowrap label={t('request.template.approval')} />
              {option.requiresApproval ? (
                <StatusIndicator type="warning">
                  <span data-wrap>{t('request.template.requiresApproval')}</span>
                </StatusIndicator>
              ) : (
                <StatusIndicator type="success">
                  <span data-wrap>{t('request.template.noApprovalRequired')}</span>
                </StatusIndicator>
              )}
            </Box>
          </ColumnLayout>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export const SelectLeaseTemplate = ({
  input,
  showError,
  label,
  description,
  meta: { error },
}: SelectLeaseTemplateProps) => {
  const { t } = useTranslation('leases');
  const [selectedLeaseTemplates, setSelectedLeaseTemplates] = useState<
    LeaseTemplate[]
  >([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const {
    data: leaseTemplates,
    isLoading,
    isError,
    refetch,
    error: fetchError,
  } = useGetLeaseTemplates();

  const handleSelectionChange = ({ detail }: { detail: any }) => {
    if (detail.selectedItems.length > 0) {
      const leaseTemplate = detail.selectedItems[0];
      input.onChange(leaseTemplate.uuid);
    } else {
      input.onChange(undefined);
    }
  };

  // Filter templates by name
  const filteredLeaseTemplates = useMemo(() => {
    if (!leaseTemplates) return [];

    // If no search term, return all templates
    if (!searchTerm.trim()) {
      return leaseTemplates;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return leaseTemplates.filter((template) =>
      template.name.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [leaseTemplates, searchTerm]);

  // Update selected templates
  useEffect(() => {
    if (!input.value || !leaseTemplates) return;

    const leaseTemplate = leaseTemplates.find(
      (x) => x.uuid === input.value.toString(),
    );

    if (leaseTemplate) {
      setSelectedLeaseTemplates([leaseTemplate]);
    }
  }, [input.value, leaseTemplates]);

  // Calculate paginated items
  const paginatedLeaseTemplates = useMemo(() => {
    if (!filteredLeaseTemplates.length) return [];

    const startIndex = (currentPageIndex - 1) * LEASE_TEMPLATES_PER_PAGE;
    const endIndex = startIndex + LEASE_TEMPLATES_PER_PAGE;
    return filteredLeaseTemplates.slice(startIndex, endIndex);
  }, [filteredLeaseTemplates, currentPageIndex]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!filteredLeaseTemplates.length) return 1;
    return Math.ceil(filteredLeaseTemplates.length / LEASE_TEMPLATES_PER_PAGE);
  }, [filteredLeaseTemplates]);

  useEffect(() => {
    if (searchTerm !== "") {
      setCurrentPageIndex(1);
    }
  }, [searchTerm]);

  if (isLoading) {
    return <Loader label={t('request.template.loading')} />;
  }

  if (isError) {
    return (
      <ErrorPanel
        description={t('request.template.loadError')}
        retry={refetch}
        error={fetchError as Error}
      />
    );
  }

  if ((leaseTemplates || []).length === 0) {
    return (
      <Alert type="error" header={t('request.template.noTemplatesHeader')}>
        {t('request.template.noTemplatesMessage')}
      </Alert>
    );
  }

  if (!isLoading) {
    return (
      <SpaceBetween size="s">
        <FormField label={label} description={description} />
        <ColumnLayout columns={2}>
          <Box>
            <Input
              type="search"
              placeholder={t('request.template.searchPlaceholder')}
              value={searchTerm}
              onChange={({ detail }) => setSearchTerm(detail.value)}
              ariaLabel={t('request.template.searchAriaLabel')}
            />
          </Box>

          {totalPages > 1 && (
            <Box float="right">
              <Pagination
                currentPageIndex={currentPageIndex}
                pagesCount={totalPages}
                onChange={({ detail }) =>
                  setCurrentPageIndex(detail.currentPageIndex)
                }
                ariaLabels={{
                  nextPageLabel: t('request.template.nextPage'),
                  previousPageLabel: t('request.template.previousPage'),
                  pageLabel: (pageNumber) =>
                    t('request.template.pageLabel', { pageNumber, totalPages }),
                }}
              />
            </Box>
          )}
        </ColumnLayout>
        <Box>
          {filteredLeaseTemplates.length === 0 && searchTerm.trim() !== "" ? (
            <Alert type="info" header={t('request.template.noMatchingHeader')}>
              {t('request.template.noMatchingMessage')}
            </Alert>
          ) : (
            <Cards
              items={paginatedLeaseTemplates}
              selectedItems={selectedLeaseTemplates}
              onSelectionChange={handleSelectionChange}
              entireCardClickable
              selectionType="single"
              cardDefinition={{
                header: (option) => option.name,
                sections: [
                  {
                    // prettier-ignore
                    content: (option) => <LeaseTemplateCardContent option={option} />, // NOSONAR typescript:S6478 - the way the card component works requires defining component during render
                  },
                ],
              }}
            />
          )}
          <FormField errorText={showError && error}></FormField>
        </Box>
      </SpaceBetween>
    );
  }
};
