// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HelpPanel } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";

import { MarkdownLink } from "@amzn/innovation-sandbox-frontend/components/Markdown/MarkdownLink";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

interface MarkdownProps {
  file: string;
}

const markdownComponents: Components = {
  a: (props: any) => <MarkdownLink {...props} />,
};

export const Markdown = ({ file }: MarkdownProps) => {
  const { i18n } = useTranslation();
  const [markdown, setMarkdown] = useState<any>();

  const init = async () => {
    const lang = i18n.language === 'fr-CA' ? 'fr' : 'en';
    try {
      const md = await import(`../../markdown/${lang}/${file}.md`);
      setMarkdown(md);
    } catch (error) {
      // Fallback to English if French not available
      try {
        const md = await import(`../../markdown/en/${file}.md`);
        setMarkdown(md);
      } catch (fallbackError) {
        console.error('Failed to load markdown file:', fallbackError);
      }
    }
  };

  useEffect(() => {
    init();
  }, [file, i18n.language]); // Re-run when language changes

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
