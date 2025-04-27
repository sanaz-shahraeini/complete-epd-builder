"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"
import "./globals.css";
import "../styles/css/colors.css";
import "leaflet/dist/leaflet.css";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { locales, defaultLocale } from "../i18n/navigation";

export default function RootLayout({ children }) {
  const [messages, setMessages] = React.useState({});
  const locale = defaultLocale;

  // Load messages for the current locale
  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        const loadedMessages = await import(`../messages/${locale}.json`).then(module => module.default);
        setMessages(loadedMessages);
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        setMessages({});
      }
    };
    
    loadMessages();
  }, [locale]);

  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          html {
            font-size: 16px !important;
          }
          
          /* Target only header components */
          .MuiAppBar-root .MuiTypography-h6 {
            font-size: 1rem !important;
          }
          
          .header-title {
            font-size: 16px !important;
          }
          
          @media screen and (min-width: 0px) {
            .MuiAppBar-root {
              --mui-typography-h6-fontSize: 16px;
            }
          }
        `}} />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <ThemeProvider theme={theme}>
            <SessionProvider>
              <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
                {children}
              </NextIntlClientProvider>
            </SessionProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
