import { getTranslations as getInterfaceTranslations } from "next-intl/server";
import { useTranslations as useInterfaceTranslations } from "next-intl";
import { Search } from "lucide-react";

interface WidgetPageProps {
  params: Promise<{ widgetId: string }>;
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  const translateInterface = await getInterfaceTranslations("interface");

  const { widgetId } = await params;

  if (widgetId === "quick-search") {
    return <QuickSearchWidget />;
  }

  return (
    <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
      {translateInterface("m05ac5fdd1798")}{" "}{widgetId}
    </div>
  );
}

function QuickSearchWidget() {
  const translateInterface = useInterfaceTranslations("interface");

  return (
    <div className="flex h-full items-center justify-center p-3">
      <form
        action="/search"
        method="GET"
        target="_top"
        className="relative w-full max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="q"
          placeholder={translateInterface("me5e6bff7707c")}
          className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:shadow-sm transition-all"
        />
      </form>
    </div>
  );
}
