import { Link2, ListOrdered, Search, Settings, Shield } from "lucide-react";
import { getSession } from "@/lib/auth";
import { createApiClient } from "@/lib/api";
import { redirect } from "next/navigation";

export async function SearchSettingsPanel({ embedded = false }: { embedded?: boolean }) {
  const session = await getSession("ye-search").catch(() => null);
  if (!session) redirect("/api/auth/sso");

  const api = createApiClient("ye-search");
  const settingsRes = await api.getUserSettings(session.userId).catch(() => null);
  const settings = (settingsRes as { settings?: Record<string, string> })?.settings ?? {};

  const safeSearch = settings.safeSearch ?? "moderate";
  const resultsPerPage = settings.resultsPerPage ?? "10";

  return (
    <div className={embedded ? "p-4" : "mx-auto max-w-2xl px-4 py-8"}>
      {!embedded && (
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Search Settings</h1>
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Safe Search</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Filter explicit content from search results.</p>
          <div className="flex gap-2">
            {[
              { value: "off", label: "Off" },
              { value: "moderate", label: "Moderate" },
              { value: "strict", label: "Strict" },
            ].map((opt) => (
              <span
                key={opt.value}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  safeSearch === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Results Per Page</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Number of results shown per search page.</p>
          <div className="flex gap-2">
            {["10", "20", "30"].map((n) => (
              <span
                key={n}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  resultsPerPage === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Search Engine</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Search results are provided by a connected search engine. Connections are managed in YouEye Settings.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">About Search</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            YouEye Search routes queries through your connected search engine. No search data is stored, tracked, or profiled.
          </p>
        </section>
      </div>
    </div>
  );
}
