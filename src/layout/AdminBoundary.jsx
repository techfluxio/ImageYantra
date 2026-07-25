import { Suspense } from 'react';
import PageLoader from '../components/layout/PageLoader.jsx';

/** Wraps a lazy-loaded element with its own Suspense boundary, since
 *  admin routes are top-level entries in routes.jsx (outside
 *  PublicLayout, which has its own boundary for public pages). */
export default function AdminBoundary({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
