import { useEffect } from 'react';

/**
 * useOutsideClick — calls `handler` when a click occurs outside `ref`.
 */
export function useOutsideClick(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function listener(event) {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
