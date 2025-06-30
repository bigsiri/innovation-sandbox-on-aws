// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Popover, StatusIndicator } from "@cloudscape-design/components";
import moment from "moment";
import 'moment/locale/fr'; // Import French locale

import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { formatDistanceToNowLocalized } from "@amzn/innovation-sandbox-frontend/i18n/utils/dateLocalization";

interface DurationStatusProps {
  date?: Date | string;
  durationInHours?: number;
  expired?: boolean;
}

export const DurationStatus = ({
  date,
  durationInHours,
  expired,
}: DurationStatusProps) => {
  const { t, currentLanguage } = useTranslation();

  // Set moment locale based on current language
  moment.locale(currentLanguage === 'fr-CA' ? 'fr' : 'en');

  if (date) {
    const isLessThanOneHourFromNow =
      moment(date).diff(moment(), "hours") < 1 && !expired;

    const isExpired = moment(date).isBefore(moment());
    const popoverContent = isExpired 
      ? t('duration.popover.expired', { 
          ns: 'common', 
          replace: { date: moment(date).format("lll") } 
        })
      : t('duration.popover.willExpire', { 
          ns: 'common', 
          replace: { date: moment(date).format("lll") } 
        });

    return (
      <Popover
        position="top"
        size="large"
        dismissButton={false}
        content={popoverContent}
      >
        {isLessThanOneHourFromNow 
          ? t('duration.expiringSoon', { ns: 'common' })
          : formatDistanceToNowLocalized(new Date(date), currentLanguage)
        }
      </Popover>
    );
  }

  if (durationInHours) {
    // Calculate days for fallback logic
    const days = Math.floor(durationInHours / 24);
    const hours = durationInHours % 24;
    
    let humanizedDuration;
    
    // For French Canadian, provide direct translation to avoid moment.js issues
    if (currentLanguage === 'fr-CA') {
      if (days > 0) {
        if (days === 1) {
          humanizedDuration = hours > 0 ? `1 jour ${hours} heure${hours > 1 ? 's' : ''}` : '1 jour';
        } else {
          humanizedDuration = hours > 0 ? `${days} jours ${hours} heure${hours > 1 ? 's' : ''}` : `${days} jours`;
        }
      } else {
        humanizedDuration = hours === 1 ? '1 heure' : `${hours} heures`;
      }
    } else {
      // For English, use moment.js
      moment.locale('en');
      humanizedDuration = moment.duration(durationInHours, "hours").humanize();
    }
    
    return (
      <Box>
        <Box>{humanizedDuration}</Box>
        <Box>
          <small data-muted>{t('duration.afterApproval', { ns: 'common' })}</small>
        </Box>
      </Box>
    );
  }

  return (
    <StatusIndicator type="warning">
      {t('duration.noExpiry', { ns: 'common' })}
    </StatusIndicator>
  );
};
