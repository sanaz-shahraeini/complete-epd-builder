'use client';

import { createI18nClient } from 'next-intl';
import { defaultLocale, locales } from './navigation';

export default createI18nClient({
  locales,
  defaultLocale,
  // This callback is called when a new locale is set
  onError(error) {
    console.error('i18n error:', error);
  },
  // This callback is called when messages for a new locale are loaded
  onSuccess() {
    console.log('i18n loaded successfully');
  },
  // Load messages for the current locale
  getMessages: async (locale) => {
    console.log('Attempting to load messages for locale:', locale);
    try {
      const messages = (await import(`../messages/${locale}.json`)).default;
      console.log('Loaded messages keys:', Object.keys(messages));
      return messages;
    } catch (error) {
      console.error(`Failed to load messages for locale ${locale}:`, error);
      return {};
    }
  }
});