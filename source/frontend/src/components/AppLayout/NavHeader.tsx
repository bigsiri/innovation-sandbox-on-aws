// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import TopNavigation, {
  TopNavigationProps,
} from "@cloudscape-design/components/top-navigation";
import { Density, Mode } from "@cloudscape-design/global-styles";
import { FC, useMemo } from "react";

import { IsbUser } from "@amzn/innovation-sandbox-commons/types/isb-types";
import { useAppContext } from "@amzn/innovation-sandbox-frontend/components/AppContext/context";
import { spacerSvg } from "@amzn/innovation-sandbox-frontend/components/AppLayout/constants";
import { usFlag, canadaFlag } from "@amzn/innovation-sandbox-frontend/components/AppLayout/flags";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { SupportedLanguages } from "@amzn/innovation-sandbox-frontend/i18n/types";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

export interface NavHeaderProps {
  title?: string;
  logo?: string;
  href?: string;
  user?: IsbUser;
  onExit?: () => void;
  showLanguageSwitcher?: boolean;
  onLanguageChange?: (language: SupportedLanguages) => void;
}

export const NavHeader: FC<NavHeaderProps> = ({
  title,
  href = "/",
  logo,
  user,
  onExit,
  showLanguageSwitcher = true,
  onLanguageChange,
}) => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const { theme, density, setTheme, setDensity } = useAppContext();
  const { setToolsOpen, setToolsHide } = useAppLayoutContext();

  // Use translated title if not provided
  const displayTitle = title || t('header.title', { ns: 'navigation' });

  // Handle language change
  const handleLanguageChange = async (newLanguage: SupportedLanguages) => {
    try {
      await changeLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const utilities: TopNavigationProps.Utility[] = useMemo(() => {
    const menu: TopNavigationProps.Utility[] = [];

    // Add language switcher as a dropdown utility
    if (showLanguageSwitcher) {
      menu.push({
        type: "menu-dropdown",
        iconName: "globe",
        ariaLabel: t('languageSwitcher.ariaLabel', { ns: 'common' }),
        title: currentLanguage === 'en' ? 'EN' : 'FR',
        items: [
          {
            id: "language.en",
            text: t('languageSwitcher.english', { ns: 'common' }),
            iconName: currentLanguage === 'en' ? "check" : undefined,
            iconSvg: usFlag,
          },
          {
            id: "language.fr-CA",
            text: t('languageSwitcher.frenchCanadian', { ns: 'common' }),
            iconName: currentLanguage === 'fr-CA' ? "check" : undefined,
            iconSvg: canadaFlag,
          },
        ],
        onItemClick: (e) => {
          switch (e.detail.id) {
            case "language.en":
              if (currentLanguage !== 'en') {
                handleLanguageChange('en');
              }
              break;
            case "language.fr-CA":
              if (currentLanguage !== 'fr-CA') {
                handleLanguageChange('fr-CA');
              }
              break;
            default:
              break;
          }
        },
      });
    }

    // Add settings menu
    menu.push({
      type: "menu-dropdown",
      iconName: "settings",
      ariaLabel: t('header.settings.ariaLabel', { ns: 'navigation' }),
      items: [
        {
          id: "theme",
          text: t('header.settings.theme', { ns: 'navigation' }),
          items: [
            {
              id: "theme.light",
              text: t('header.settings.themeLight', { ns: 'navigation' }),
              iconName: theme === Mode.Light ? "check" : undefined,
              iconSvg: theme !== Mode.Light ? spacerSvg : undefined,
            },
            {
              id: "theme.dark",
              text: t('header.settings.themeDark', { ns: 'navigation' }),
              iconName: theme === Mode.Dark ? "check" : undefined,
              iconSvg: theme !== Mode.Dark ? spacerSvg : undefined,
            },
          ],
        },
        {
          id: "density",
          text: t('header.settings.density', { ns: 'navigation' }),
          items: [
            {
              id: "density.comfortable",
              text: t('header.settings.densityComfortable', { ns: 'navigation' }),
              iconName: density === Density.Comfortable ? "check" : undefined,
              iconSvg:
                density !== Density.Comfortable ? spacerSvg : undefined,
            },
            {
              id: "density.compact",
              text: t('header.settings.densityCompact', { ns: 'navigation' }),
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
    });

    // Add info button
    menu.push({
      type: "button",
      iconName: "status-info",
      ariaLabel: t('header.info.ariaLabel', { ns: 'navigation' }),
      onClick: () => {
        setToolsHide(false);
        setToolsOpen((prev) => !prev);
      },
    });

    // Add user menu if user is provided
    if (user) {
      menu.push({
        type: "menu-dropdown",
        text: user.displayName,
        description: user.email,
        iconName: "user-profile",
        items: [{ 
          id: "exit", 
          text: t('header.user.exit', { ns: 'navigation' })
        }],
        onItemClick: onExit,
      });
    }

    return menu;
  }, [
    showLanguageSwitcher,
    currentLanguage,
    theme, 
    density, 
    setDensity, 
    setTheme, 
    user, 
    onExit, 
    t,
    setToolsHide,
    setToolsOpen
  ]);

  const topNavLogo = logo ? { src: logo, alt: displayTitle } : undefined;

  return (
    <>
      <div id="app-header">
        <TopNavigation
          utilities={utilities}
          i18nStrings={{
            overflowMenuTitleText: t('header.overflowMenuTitle', { ns: 'navigation' }),
            overflowMenuTriggerText: t('header.overflowMenuTitle', { ns: 'navigation' }),
          }}
          identity={{
            title: displayTitle,
            href: href,
            logo: topNavLogo,
          }}
        />
      </div>
    </>
  );
};
