import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '../components/layout/Navigation.jsx';
import Footer from '../components/layout/Footer.jsx';
import RouteProgressBar from '../components/layout/RouteProgressBar.jsx';
import PageLoader from '../components/layout/PageLoader.jsx';
import { useAnalyticsBeacon } from '../hooks/useAnalyticsBeacon.js';
import { installGlobalGlitchCapture } from '../utils/errorReporting.js';

/**
 * Shared chrome for every public page: progress bar, nav, footer,
 * with the matched page rendered via <Outlet/>. Used as the parent
 * route element for the whole public route tree in routes.jsx.
 * Admin routes are separate top-level entries and don't use this.
 */
export default function PublicLayout() {
  useLocation(); // ensures this re-renders on route change (progress bar relies on it too)
  useAnalyticsBeacon();
  useEffect(() => { installGlobalGlitchCapture(); }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--col-bg)',
        color: 'var(--col-text)',
        fontFamily: 'var(--ff-body)',
      }}
    >
      <RouteProgressBar />
      <Navigation />
      <div style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
