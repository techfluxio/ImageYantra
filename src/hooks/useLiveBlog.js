import { useEffect, useState } from 'react';
import { fetchLiveBlogPosts, fetchLiveBlogPost } from '../utils/publicApi.js';

/** Blog list: starts with the static bundled posts, merges in live
 *  admin-managed posts (added/edited/unpublished) once fetched. */
export function useLiveBlogPosts(staticPosts) {
  const [list, setList] = useState(staticPosts);

  useEffect(() => {
    let cancelled = false;
    fetchLiveBlogPosts().then((live) => {
      if (cancelled || !live || !live.length) return;

      const staticBySlug = new Map(staticPosts.map((p) => [p.slug, p]));
      const merged = live.map((liveePost) => {
        const staticMatch = staticBySlug.get(liveePost.slug);
        // Keep static-only display fields (readTime, dateISO) if present,
        // but live wins for title/excerpt/category/published/date.
        return staticMatch ? { ...staticMatch, ...liveePost } : liveePost;
      });
      setList(merged);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return list;
}

/** Single post by slug: returns { post, liveBody, loading }.
 *  `liveBody` is the real per-post article text from the admin panel
 *  (or null if this post hasn't been edited there yet / backend is
 *  unreachable, in which case the caller should fall back to its own
 *  placeholder content). */
export function useLiveBlogPost(slug, staticPost) {
  const [state, setState] = useState({ post: staticPost, liveBody: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ post: staticPost, liveBody: null, loading: true });

    fetchLiveBlogPost(slug).then((live) => {
      if (cancelled) return;
      if (live) {
        setState({
          post: staticPost ? { ...staticPost, ...live } : live,
          liveBody: live.body || null,
          loading: false,
        });
      } else {
        setState({ post: staticPost, liveBody: null, loading: false });
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return state;
}
