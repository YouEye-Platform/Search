/**
 * Root Layout — Search App (Canvas SDK)
 */

import { InstallBanner } from "@/components/pwa/install-banner";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { createApiClient } from "@/lib/api";
import {
  getThemeCSSVariables,
  getThemeMode,
  generateThemeStyle,
  generateSystemThemeScript,
} from "@/lib/theme";
import { AppHeader } from "@/lib/components/layout";
import { HeaderSearchBar } from "@/components/header-search-bar";
import { LaunchRequirementsBanner } from "@/components/launch-requirements-banner";
import { Search } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const appName = process.env.APP_NAME || "Search";
  return {
    title: appName,
    description: "Privacy-respecting web search",
    icons: { icon: "/api/pwa/icon?size=32" },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: appName,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession("ye-search").catch(() => null);

  let headerConfig = null;
  let launchRequirements = null;
  if (session) {
    const api = createApiClient("ye-search");
    [headerConfig, launchRequirements] = await Promise.all([
      api.fetchHeaderConfig(session.userId),
      api.getLaunchRequirements(session.userId, process.env.SEARCH_EXTERNAL_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL),
    ]);
  }

  const cssVariables = getThemeCSSVariables(headerConfig);
  const themeStyle = generateThemeStyle(cssVariables);
  const themeMode = getThemeMode(headerConfig);
  const isSystemTheme = themeMode === "system";
  const htmlClass = isSystemTheme ? "" : themeMode;

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <head>
        {isSystemTheme && (
          <script dangerouslySetInnerHTML={{ __html: generateSystemThemeScript() }} />
        )}
        {themeStyle && (
          <style
            id="ye-theme"
            dangerouslySetInnerHTML={{ __html: themeStyle }}
          />
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {session && (
          <>
            <AppHeader
              appId="ye-search"
              appName="Search"
              appIcon={<Search className="h-5 w-5" />}
              navItems={[]}
              appMenuItems={[]}
            >
              <HeaderSearchBar />
            </AppHeader>
            <LaunchRequirementsBanner requirements={launchRequirements} />
          </>
        )}
        <main>{children}</main>
        <InstallBanner appName="Search" />
      </body>
    </html>
  );
}
