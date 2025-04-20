import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './navigation';

export default getRequestConfig(async ({requestLocale}) => {
  // Await the requestLocale as recommended
  const locale = await requestLocale;

  // Ensure that the incoming `locale` is valid
  if (!locale || !locales.includes(locale as any)) {
    return { locale: defaultLocale };
  }

  // Explicitly define our messages path format
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    // Fallback to default locale if messages not found
    messages = (await import(`../messages/${defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages,
    // Set timeZone for consistent date/time formatting
    timeZone: 'UTC'
  };
});