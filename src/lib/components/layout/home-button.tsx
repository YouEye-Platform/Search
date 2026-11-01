"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
/**
 * Home Button — Links back to the YE-UI dashboard.
 */



import { Home } from "lucide-react";

interface HomeButtonProps {
  uiBaseUrl: string;
}

export function HomeButton({ uiBaseUrl }: HomeButtonProps) {
  const translateInterface = useInterfaceTranslations("interface");

  let href = uiBaseUrl;
  if (!href && typeof window !== "undefined") {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 2) {
      href = `${window.location.protocol}//${parts.slice(1).join(".")}`;
    }
  }
  if (!href) href = "/";

  return (
    <a
      href={href}
      title={translateInterface("m3a78695388b3")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
    >
      <Home className="h-4 w-4" />
    </a>
  );
}
