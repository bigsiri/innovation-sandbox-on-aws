import moment from 'moment';
import 'moment/locale/fr';
import i18n from '@amzn/innovation-sandbox-frontend/i18n';

// Manually define French relative time strings
const frenchRelativeTime = {
  future: 'dans %s',
  past: 'il y a %s',
  s: 'quelques secondes',
  ss: '%d secondes',
  m: 'une minute',
  mm: '%d minutes',
  h: 'une heure',
  hh: '%d heures',
  d: 'un jour',
  dd: '%d jours',
  M: 'un mois',
  MM: '%d mois',
  y: 'un an',
  yy: '%d ans'
};

export const getLocalizedMoment = () => {
  const currentLang = i18n.language;
  
  if (currentLang === 'fr-CA') {
    // Manually set French locale
    moment.defineLocale('fr-custom', {
      relativeTime: frenchRelativeTime,
      months: 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
      monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
      weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
      weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
      weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd D MMMM YYYY HH:mm'
      }
    });
    moment.locale('fr-custom');
  } else {
    moment.locale('en');
  }
  
  // Add duration method to the returned moment object
  const localizedMoment = moment;
  localizedMoment.duration = moment.duration;
  
  return localizedMoment;
};
