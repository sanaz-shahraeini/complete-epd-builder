
"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme"
import "./globals.css";
import "../styles/css/colors.css";
import { Poppins } from "next/font/google";
import { ProductsProvider } from "../useContexts/ProductsContext"; // وارد کردن ProductsProvider
import { SearchProvider } from "../useContexts/SearchContext"; // وارد کردن SearchProvider

const poppins= Poppins({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={poppins.className}>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
