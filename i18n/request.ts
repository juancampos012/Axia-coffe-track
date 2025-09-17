import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

import en from '../messages/en.json';
import es from '../messages/es.json'; // o el idioma que estés usando
import fr from '../messages/fr.json';

const messagesMap = {
  en,
  es,
  fr,
  // agrega más locales aquí
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messagesMap[locale as keyof typeof messagesMap],
  };
});
