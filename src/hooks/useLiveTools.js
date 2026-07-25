import { useEffect, useState } from 'react';
import { fetchLiveTools } from '../utils/publicApi.js';

/**
 * Starts with the static (bundled) tool list so the page renders
 * instantly with no loading flicker, then quietly merges in live
 * data from the admin backend once it arrives. If the backend is
 * unreachable, the static list is all that's ever shown — nothing
 * breaks.
 *
 * Merge rules:
 *  - Tools that exist in both: live wins for name/desc/active/order
 *    (so admin edits show up), but icon/longDesc/faqs come from the
 *    static data since the admin panel doesn't manage those yet.
 *  - Tools added only via the admin panel: shown as-is (icon falls
 *    back to a generic one automatically).
 *  - Tools deleted via the admin panel: removed from the list.
 *  - Tools marked inactive via the admin panel: hidden.
 */
export function useLiveTools(staticTools, category) {
  const staticForCategory = staticTools.filter((t) => t.category === category);
  const [list, setList] = useState(staticForCategory);

  useEffect(() => {
    let cancelled = false;
    fetchLiveTools().then((live) => {
      if (cancelled || !live) return;

      const staticBySlug = new Map(staticForCategory.map((t) => [t.slug, t]));
      const merged = live
        .filter((t) => t.category === category)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((liveTool) => {
          const staticMatch = staticBySlug.get(liveTool.slug);
          return staticMatch
            ? { ...staticMatch, name: liveTool.name, desc: liveTool.desc, popular: liveTool.popular }
            : { ...liveTool }; // brand-new admin-only tool — icon falls back automatically
        });

      if (merged.length) setList(merged);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return list;
}
