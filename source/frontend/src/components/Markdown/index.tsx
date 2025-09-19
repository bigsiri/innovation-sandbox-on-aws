// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HelpPanel } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { useTranslation } from "react-i18next";

import { MarkdownLink } from "@amzn/innovation-sandbox-frontend/components/Markdown/MarkdownLink";

interface MarkdownProps {
  file: string;
}

const markdownComponents: Components = {
  a: (props: any) => <MarkdownLink {...props} />,
};

export const Markdown = ({ file }: MarkdownProps) => {
  const [markdown, setMarkdown] = useState<any>();
  const { i18n } = useTranslation();

  const init = async () => {
    try {
      // Try to load language-specific markdown file first
      const language = i18n.language === 'fr-CA' ? 'fr-CA' : 'en';
      const md = await import(`../../markdown/${language}/${file}.md`);
      setMarkdown(md);
    } catch (error) {
      // Fallback to default English markdown if language-specific file doesn't exist
      try {
        const md = await import(`../../markdown/${file}.md`);
        setMarkdown(md);
      } catch (fallbackError) {
        console.error(`Could not load markdown file: ${file}`, fallbackError);
      }
    }
  };

  useEffect(() => {
    init();
  }, [file, i18n.language]);

  if (markdown) {
    return (
      <HelpPanel header={markdown.attributes.title}>
        <ReactMarkdown components={markdownComponents}>
          {markdown.markdown}
        </ReactMarkdown>
      </HelpPanel>
    );
  }
};
