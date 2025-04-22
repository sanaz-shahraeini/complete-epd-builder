"use client";
import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme"
import "./globals.css";
import "../styles/css/colors.css";

export default function RootLayout({ children }) {
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
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
