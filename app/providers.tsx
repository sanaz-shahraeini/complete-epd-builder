"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "@/lib/error-boundary";
import { SessionProvider } from "next-auth/react";
import { SessionMonitor } from "@/components/session/SessionMonitor";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/components/theme-provider";
import { Theme } from "@radix-ui/themes";
import { useLocale } from "next-intl";

interface ProvidersProps {
  children: ReactNode;
  session: any;
  messages: any;
  locale: string;
}

export function Providers({
  children,
  session,
  messages,
  locale,
}: ProvidersProps) {
  // Fallback to 'en' if no locale is provided
  const safeLocale = locale || "en";

  console.log("Providers - Locale:", safeLocale);
  console.log(
    "Providers - Session:",
    session ? "Session exists" : "No session"
  );

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <SessionMonitor />
        <NextIntlClientProvider
          messages={messages}
          locale={safeLocale}
          timeZone="UTC"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Theme>{children}</Theme>
          </ThemeProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
