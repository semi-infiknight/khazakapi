import { useEffect, useState } from "react";

/** Catalogue + hero + intent layouts switch at 860px. */
export const MOBILE_LAYOUT_QUERY = "(max-width: 860px)";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

export function useMobileLayout() {
  return useMediaQuery(MOBILE_LAYOUT_QUERY);
}
