import { lazy } from 'react';
import PublicLayout from './layout/PublicLayout.jsx';
import AdminBoundary from './layout/AdminBoundary.jsx';

/* ── Public pages (eager — above the fold / crawled often) ── */
import HomePage from './pages/HomePage.jsx';
import BlogListPage from './pages/BlogListPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';
import ExamToolsPage from './pages/ExamToolsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ToolPage from './pages/ToolPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/* ── Admin (lazy-loaded, excluded from static prerendering — see
   ssgOptions.includedRoutes in vite.config.js) ── */
const AdminLogin      = lazy(() => import('./admin/AdminLogin.jsx'));
const AdminLayout     = lazy(() => import('./admin/AdminLayout.jsx'));
const AdminDashboard  = lazy(() => import('./admin/AdminDashboard.jsx'));
const AdminTools      = lazy(() => import('./admin/AdminTools.jsx'));
const AdminCategories = lazy(() => import('./admin/AdminCategories.jsx'));
const AdminBlog       = lazy(() => import('./admin/AdminBlog.jsx'));
const AdminFooter     = lazy(() => import('./admin/AdminFooter.jsx'));
const AdminAds        = lazy(() => import('./admin/AdminAds.jsx'));
const AdminGlitches   = lazy(() => import('./admin/AdminGlitches.jsx'));
const AdminSettings   = lazy(() => import('./admin/AdminSettings.jsx'));
const AdminPages      = lazy(() => import('./admin/AdminPages.jsx'));
const AdminBackup     = lazy(() => import('./admin/AdminBackup.jsx'));

/* ── Data used to pre-generate one real .html file per dynamic page ── */
import { IMAGE_TOOLS } from './data/imageTools.js';
import { PDF_TOOLS } from './data/pdfTools.js';
import { ID_PHOTO_SIZES, BLOG_POSTS } from './data/index.js';
import { SOCIAL_TOOLS } from './data/socialTools.js';
import { OTHER_TOOLS } from './data/otherTools.js';
import { EXAM_TOOLS } from './data/examTools.js';
// Snapshot of Supabase content taken at build time by
// scripts/fetch-live-content.js (see package.json "prebuild") — empty
// arrays if the backend isn't set up yet, so this never breaks the build.
import liveContent from './data/generated/live.json';

const ALL_TOOL_SLUGS = Array.from(
  new Set(
    [...IMAGE_TOOLS, ...PDF_TOOLS, ...ID_PHOTO_SIZES, ...SOCIAL_TOOLS, ...OTHER_TOOLS, ...EXAM_TOOLS, ...liveContent.tools]
      .map((t) => t.slug)
      .filter(Boolean),
  ),
);

const BLOG_SLUGS = Array.from(
  new Set([...BLOG_POSTS, ...liveContent.blogPosts].map((p) => p.slug).filter(Boolean)),
);

/* The 5 categories that share the generic CategoryPage (Exam Tools keeps
   its own richer page — authority badges, exam groups — since that's
   fundamentally different content, not just a styling variant). Any
   brand-new category an admin creates also gets a real prerendered page
   here automatically, because it's read from the same live snapshot. */
const STATIC_CATEGORY_SLUGS = ['image-tools', 'pdf-tools', 'id-photo-sizes', 'social-tools', 'other-tools'];
const EXTRA_CATEGORY_SLUGS = (liveContent.categories || [])
  .map((c) => c.slug)
  .filter((slug) => slug && !STATIC_CATEGORY_SLUGS.includes(slug) && slug !== 'exam-tools');
const ALL_CATEGORY_SLUGS = [...STATIC_CATEGORY_SLUGS, ...EXTRA_CATEGORY_SLUGS];

export const routes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogPostPage />, getStaticPaths: () => BLOG_SLUGS.map((s) => `blog/${s}`) },
      { path: 'exam-tools', element: <ExamToolsPage /> },
      {
        path: ':categorySlug',
        element: <CategoryPage />,
        getStaticPaths: () => ALL_CATEGORY_SLUGS,
      },
      { path: 'tools/:slug', element: <ToolPage />, getStaticPaths: () => ALL_TOOL_SLUGS.map((s) => `tools/${s}`) },
      { path: 'about', element: <LegalPage pageKey="about" /> },
      { path: 'privacy', element: <LegalPage pageKey="privacy" /> },
      { path: 'terms', element: <LegalPage pageKey="terms" /> },
      { path: 'disclaimer', element: <LegalPage pageKey="disclaimer" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  /* Admin panel — no public Navigation/Footer, not statically prerendered. */
  { path: '/admin/login', element: <AdminBoundary><AdminLogin /></AdminBoundary> },
  {
    path: '/admin',
    element: <AdminBoundary><AdminLayout /></AdminBoundary>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'tools', element: <AdminTools /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'blog', element: <AdminBlog /> },
      { path: 'footer', element: <AdminFooter /> },
      { path: 'ads', element: <AdminAds /> },
      { path: 'glitches', element: <AdminGlitches /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'pages', element: <AdminPages /> },
      { path: 'backup', element: <AdminBackup /> },
    ],
  },
];