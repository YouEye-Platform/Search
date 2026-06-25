import { createInterAppHandler } from "@/lib/routes/inter-app";

export const POST = createInterAppHandler({
  search: async (data) => {
    const baseUrl =
      process.env.SEARCH_ENGINE_URL?.replace("app-searxng.youeye", "app-searxng-main.youeye") ??
      "http://app-searxng-main.youeye:8080";

    const params = new URLSearchParams({
      q: data.query as string,
      format: "json",
      pageno: (data.page as string) || "1",
    });

    try {
      const res = await fetch(`${baseUrl}/search?${params.toString()}`, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        return { error: `Search engine returned ${res.status}`, results: [] };
      }
      const json = await res.json();
      return { provider: "ye-search", results: json.results ?? [] };
    } catch {
      return { error: "Search engine unreachable", results: [] };
    }
  },
});
