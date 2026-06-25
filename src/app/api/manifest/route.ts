import { createManifestHandler } from "@/lib/routes/manifest";
import packageJson from "../../../../package.json";

export const GET = createManifestHandler({
  id: "ye-search",
  name: "Search",
  version: packageJson.version,
  description: "Privacy-respecting web search powered by your connected search engine",
  icon: "Search",
  accent_color: "#f59e0b",
  permissions: ["timeline:write"],
  surfaceSchemaVersion: 1,
  surfaces: [
    {
      id: "app-settings",
      kind: "settings-panel",
      placement: "app-settings",
      name: "App Settings",
      description: "App-owned settings panel",
      embedPath: "/embed/settings",
      permissions: [],
    },
    {
      id: "quick-search",
      kind: "widget",
      placement: "dashboard",
      name: "Quick Search",
      description: "Search bar widget for your dashboard",
      embedPath: "/embed/widget/quick-search",
      permissions: [],
      defaultSize: { width: 30, height: 7 },
      minSize: { width: 20, height: 5 },
      maxSize: { width: 50, height: 12 },
    },
    {
      id: "search-query",
      kind: "timeline-card",
      placement: "timeline",
      name: "Search query",
      description: "Web search performed",
      embedPath: "/embed/timeline/search",
      permissions: ["timeline:write"],
      triggers: ["search-query"],
    },
    {
      id: "search-link-clicked",
      kind: "timeline-card",
      placement: "timeline",
      name: "Search result click",
      description: "Search result link clicked",
      embedPath: "/embed/timeline/search",
      permissions: ["timeline:write"],
      triggers: ["search-link-clicked"],
    },
  ],
  inter_app: {
    provides: [
      { type: "search", description: "Search the web via connected search engine (SearXNG, Whoogle)" },
    ],
  },
  wants: [
    {
      type: "search-engine",
      name: "Search Engine",
      description: "Any compatible search engine backend (SearXNG, Whoogle, etc.)",
      defaultPort: 8080,
    },
    {
      appId: "searxng",
      name: "SearXNG",
      description: "Private meta-search engine",
      defaultPort: 8080,
      proxy: {
        paths: ["/search*", "/autocompleter*"],
        methods: ["GET"],
      },
    },
    {
      appId: "whoogle",
      name: "Whoogle",
      description: "Privacy search frontend",
      defaultPort: 3000,
    },
  ],
  internet: {
    hosts: [],
    proxy: [],
  },
  settings: {
    schema: [
      {
        key: "safeSearch",
        type: "select",
        label: "Safe Search",
        default: "moderate",
        options: [
          { label: "Off", value: "off" },
          { label: "Moderate", value: "moderate" },
          { label: "Strict", value: "strict" },
        ],
      },
      {
        key: "resultsPerPage",
        type: "select",
        label: "Results Per Page",
        default: "10",
        options: [
          { label: "10", value: "10" },
          { label: "20", value: "20" },
          { label: "30", value: "30" },
        ],
      },
    ],
  },
});
