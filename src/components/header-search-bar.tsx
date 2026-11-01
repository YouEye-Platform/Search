"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchInput } from "./search-input";

export function HeaderSearchBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  if (pathname !== "/search" || !params.get("q")) return null;
  return <SearchInput key={`${params.get("q")}-${params.get("category")}`} initialQuery={params.get("q") || ""} category={params.get("category") || "general"} />;
}
