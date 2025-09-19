// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Box, Popover, StatusIndicator } from "@cloudscape-design/components";
import moment from "moment";
import "moment/locale/fr";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

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
  const { t, i18n } = useTranslation(['home', 'leases', 'common']);

  // Ensure moment locale is set correctly
  useEffect(() => {
    if (i18n.language === 'fr-CA') {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  }, [i18n.language]);

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
          : moment(date).fromNow()
        }
      </Popover>
    );
  }

  if (durationInHours) {
    // Calculate days for manual formatting
    const days = Math.floor(durationInHours / 24);
    const hours = durationInHours % 24;
    
    let humanizedDuration;
    
    // Manual formatting for both languages to avoid moment.js issues
    if (i18n.language === 'fr-CA') {
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
      // English formatting
      if (days > 0) {
        if (days === 1) {
          humanizedDuration = hours > 0 ? `1 day ${hours} hour${hours > 1 ? 's' : ''}` : '1 day';
        } else {
          humanizedDuration = hours > 0 ? `${days} days ${hours} hour${hours > 1 ? 's' : ''}` : `${days} days`;
        }
      } else {
        humanizedDuration = hours === 1 ? '1 hour' : `${hours} hours`;
      }
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
