import { useTranslations as useInterfaceTranslations } from "next-intl";
/**
 * Link Handler Badge — "Open in Cinema" button shown on search results
 * when a result URL matches an installed app's link handler triggers.
 */

import { ArrowUpRight } from "lucide-react";
import type { LinkHandlerProvider, LinkHandlerCard } from "./info-card-container";

interface LinkHandlerBadgeProps {
  provider: LinkHandlerProvider;
  card: LinkHandlerCard;
  resultUrl: string;
}

export function LinkHandlerBadge({ provider, card }: LinkHandlerBadgeProps) {
  const translateInterface = useInterfaceTranslations("interface");
  const builtInLabels: Record<string, string> = {"wiki:article-summary": "m0ae995a6ab68", "weather:weather-summary": "m5bf8909f7bfc", "cinema:movie-info": "m1f969427acf1", "translate:translation-preview": "m775b599621fc"};
  const labelKey = builtInLabels[`${provider.app_id}:${card.type}`];
  return (
    <a
      href={provider.app_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
    >
      {labelKey ? translateInterface(labelKey) : card.label}
      <ArrowUpRight className="h-3 w-3" />
    </a>
  );
}
