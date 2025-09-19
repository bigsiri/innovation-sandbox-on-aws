// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import TopNavigation, {
  TopNavigationProps,
} from "@cloudscape-design/components/top-navigation";
import { Density, Mode } from "@cloudscape-design/global-styles";
import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import { useAppContext } from "@amzn/innovation-sandbox-frontend/components/AppContext/context";
import { spacerSvg } from "@amzn/innovation-sandbox-frontend/components/AppLayout/constants";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

export interface NavHeaderProps {
  title: string;
  logo?: string;
  href?: string;
  user?: IsbUser;
  onExit?: () => void;
}

export const NavHeader: FC<NavHeaderProps> = ({
  title,
  href = "/",
  logo,
  user,
  onExit,
}) => {
  const { theme, density, setTheme, setDensity } = useAppContext();
  const { setToolsOpen, setToolsHide } = useAppLayoutContext();
  const { t, i18n } = useTranslation('common');

  const utilities: TopNavigationProps.Utility[] = useMemo(() => {
    const menu: TopNavigationProps.Utility[] = [
      // Language selector as separate dropdown
      {
        type: "menu-dropdown",
        iconName: "globe",
        text: i18n.language === 'fr-CA' ? t("french") : t("english"),
        ariaLabel: t("language"),
        items: [
          {
            id: "language.en",
            text: t("english"),
            iconName: i18n.language === 'en' ? "check" : undefined,
            iconSvg: i18n.language !== 'en' ? spacerSvg : undefined,
          },
          {
            id: "language.fr-CA",
            text: t("french"),
            iconName: i18n.language === 'fr-CA' ? "check" : undefined,
            iconSvg: i18n.language !== 'fr-CA' ? spacerSvg : undefined,
          },
        ],
        onItemClick: ({ detail }) => {
          console.log('Language item clicked:', detail.id);
          if (detail.id === "language.en") {
            i18n.changeLanguage('en');
          } else if (detail.id === "language.fr-CA") {
            i18n.changeLanguage('fr-CA');
          }
        },
      },
      // Settings dropdown (theme/density only)
      {
        type: "menu-dropdown",
        iconName: "settings",
        ariaLabel: t("settings"),
        items: [
          {
            id: "theme",
            text: t("theme"),
            items: [
              {
                id: "theme.light",
                text: t("light"),
                iconName: theme === Mode.Light ? "check" : undefined,
                iconSvg: theme !== Mode.Light ? spacerSvg : undefined,
              },
              {
                id: "theme.dark",
                text: t("dark"),
                iconName: theme === Mode.Dark ? "check" : undefined,
                iconSvg: theme !== Mode.Dark ? spacerSvg : undefined,
              },
            ],
          },
          {
            id: "density",
            text: t("density"),
            items: [
              {
                id: "density.comfortable",
                text: t("comfortable"),
                iconName: density === Density.Comfortable ? "check" : undefined,
                iconSvg:
                  density !== Density.Comfortable ? spacerSvg : undefined,
              },
              {
                id: "density.compact",
                text: t("compact"),
                iconName: density === Density.Compact ? "check" : undefined,
                iconSvg: density !== Density.Compact ? spacerSvg : undefined,
              },
            ],
          },
        ],
        onItemClick: (e) => {
          switch (e.detail.id) {
            case "theme.light":
              setTheme(Mode.Light);
              break;
            case "theme.dark":
              setTheme(Mode.Dark);
              break;
            case "density.comfortable":
              setDensity(Density.Comfortable);
              break;
            case "density.compact":
              setDensity(Density.Compact);
              break;
            default:
              break;
          }
        },
      },
      {
        type: "button",
        iconName: "status-info",
        onClick: () => {
          setToolsHide(false);
          setToolsOpen((prev) => !prev);
        },
      },
    ];

    if (user) {
      menu.push({
        type: "menu-dropdown",
        text: user.displayName,
        description: user.email,
        iconName: "user-profile",
        items: [{ id: "exit", text: t("exit") }],
        onItemClick: onExit,
      });
    }

    return menu;
  }, [theme, density, setDensity, setTheme, user, onExit, t, i18n.language]);

  const topNavLogo = logo ? { src: logo, alt: title } : undefined;

  return (
    <>
      <div id="app-header">
        <TopNavigation
          utilities={utilities}
          i18nStrings={{
            overflowMenuTitleText: i18n.language === 'fr-CA' ? "Innovation Sandbox sur AWS" : title,
            overflowMenuTriggerText: i18n.language === 'fr-CA' ? "Innovation Sandbox sur AWS" : title,
          }}
          identity={{
            title: i18n.language === 'fr-CA' ? "Innovation Sandbox sur AWS" : title,
            href: href,
            logo: topNavLogo,
          }}
        />
      </div>
    </>
  );
};
