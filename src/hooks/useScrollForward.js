import { useEffect } from 'react';

/**
 * While hovering anywhere inside `layoutRef` (including over the ad
 * columns, which have no scroll of their own), wheel input drives
 * `mainRef`'s internal scroll. Once `mainRef` hits the top/bottom in
 * the scroll direction, the event is allowed to bubble normally so
 * the outer page keeps scrolling (e.g. down to the footer).
 *
 * No-ops harmlessly when mainRef isn't actually scrollable (e.g. on
 * narrower screens where the fixed-viewport layout isn't active).
 */
export function useScrollForward(layoutRef, mainRef) {
  useEffect(() => {
    const layout = layoutRef.current;
    const main = mainRef.current;
    if (!layout || !main) return;

    function onWheel(e) {
      const { scrollTop, scrollHeight, clientHeight } = main;
      if (scrollHeight <= clientHeight + 1) return; // not internally scrollable — let it bubble

      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const scrollingDown = e.deltaY > 0;

      if ((scrollingDown && !atBottom) || (!scrollingDown && !atTop)) {
        e.preventDefault();
        main.scrollTop += e.deltaY;
      }
      // else: at the boundary in this direction — don't preventDefault,
      // so the wheel event falls through to scroll the page itself.
    }

    layout.addEventListener('wheel', onWheel, { passive: false });
    return () => layout.removeEventListener('wheel', onWheel);
  }, [layoutRef, mainRef]);
}
