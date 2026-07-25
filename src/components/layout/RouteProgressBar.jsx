import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Thin top progress bar shown on every route change — purely a
 * perceived-performance cue (the same trick pi7.org, YouTube, GitHub,
 * etc. use). Pages here are already bundled client-side so navigation
 * is instant; this bar just gives a visible "something happened"
 * confirmation instead of content silently swapping with no feedback.
 */
export default function RouteProgressBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setVisible(true);
    setWidth(0);

    // Two-step fill — jumps to ~70% almost immediately, completes shortly
    // after, then fades out. Mimics real network progress on purpose.
    timers.current.push(setTimeout(() => setWidth(70), 30));
    timers.current.push(setTimeout(() => setWidth(100), 220));
    timers.current.push(setTimeout(() => setVisible(false), 420));
    timers.current.push(setTimeout(() => setWidth(0), 500));

    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 3,
        width: `${width}%`,
        background: 'linear-gradient(90deg,#7c3aed,#d946ef)',
        opacity: visible ? 1 : 0,
        transition: visible
          ? 'width 0.25s ease-out, opacity 0.15s ease-in'
          : 'opacity 0.3s ease-out',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
