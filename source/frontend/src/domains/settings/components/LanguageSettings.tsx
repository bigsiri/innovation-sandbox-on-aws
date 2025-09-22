// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Select,
  Toggle,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Français (Canada)", value: "fr-CA" },
];

export const LanguageSettings = () => {
  const { t } = useTranslation("settings");
  const {
    data: config,
    isLoading,
    isError: loadingError,
    refetch,
    error,
  } = useGetConfigurations();

  if (isLoading) {
    return <Loader />;
  }

  if (loadingError || !config) {
    return (
      <ErrorPanel
        error={error || undefined}
        retry={refetch}
        description={t("loadingError")}
      />
    );
  }

  return (
    <SettingsContainer>
      <Container header={<Header variant="h2">{t("language.title")}</Header>}>
        <SpaceBetween direction="vertical" size="l">
          <FormField
            label={t("language.defaultLanguage.label")}
            description={t("language.defaultLanguage.description")}
          >
            <Select
              selectedOption={
                LANGUAGE_OPTIONS.find(
                  (option) => option.value === config.language.defaultLanguage
                ) || null
              }
              onChange={() => {
                // Read-only for now - changes made via AppConfig
              }}
              options={LANGUAGE_OPTIONS}
              placeholder={t("language.defaultLanguage.placeholder")}
              disabled={true}
            />
          </FormField>

          <FormField
            label={t("language.browserDetection.label")}
            description={t("language.browserDetection.description")}
          >
            <Toggle
              onChange={() => {
                // Read-only for now - changes made via AppConfig
              }}
              checked={config.language.enableBrowserDetection}
              disabled={true}
            >
              {t("language.browserDetection.toggle")}
            </Toggle>
          </FormField>
        </SpaceBetween>
      </Container>
    </SettingsContainer>
  );
};
