import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryToolsPage from '../components/category/CategoryToolsPage.jsx';
import { TOOL_ICONS } from '../utils/toolIcons.js';
import { CATEGORIES as STATIC_CATEGORIES } from '../data/index.js';
import { IMAGE_TOOLS } from '../data/imageTools.js';
import { PDF_TOOLS } from '../data/pdfTools.js';
import { ID_PHOTO_SIZES } from '../data/index.js';
import { SOCIAL_TOOLS } from '../data/socialTools.js';
import { OTHER_TOOLS } from '../data/otherTools.js';
import { fetchLiveCategories, fetchLiveTools, mergeBySlug } from '../utils/publicApi.js';
import generatedLive from '../data/generated/live.json';

/** Static bundled tools per category slug — the exact same catalogs the
 *  old per-category page files used, just keyed by slug in one place. */
const STATIC_TOOLS_BY_CATEGORY = {
  'image-tools': IMAGE_TOOLS,
  'pdf-tools': PDF_TOOLS.map((t) => ({ ...t, category: t.group })),
  'id-photo-sizes': ID_PHOTO_SIZES,
  'social-tools': SOCIAL_TOOLS.map((t) => ({ ...t, desc: `${t.desc} (${t.dims})` })),
  'other-tools': OTHER_TOOLS,
};

/** Category-specific filter pills (unchanged from the old per-page files). */
const CATEGORY_PILLS = {
  'image-tools': [
    { id: 'all', name: 'All Tools' },
    { id: 'edit', name: 'Edit' },
    { id: 'convert', name: 'Convert' },
  ],
  'pdf-tools': [
    { id: 'all', name: 'All Tools' },
    { id: 'Convert', name: 'Convert' },
    { id: 'Organize', name: 'Organize' },
    { id: 'Compress', name: 'Compress' },
    { id: 'Security', name: 'Security' },
  ],
};

function normalizeToolCategory(categorySlug, tool) {
  // Image Tools pills split by icon (edit vs convert), matching the old page's logic.
  if (categorySlug === 'image-tools') {
    return { ...tool, category: tool.icon === 'convert' ? 'convert' : 'edit' };
  }
  if (categorySlug === 'pdf-tools') return tool; // already has .category from .group above
  return { ...tool, category: 'all' };
}

export default function CategoryPage() {
  const { categorySlug } = useParams();

  // Merge static category list with (a) the build-time snapshot fetched by
  // scripts/fetch-live-content.js (so brand-new admin categories get a real
  // prerendered page) and (b) a live client-side fetch (so edits show up
  // instantly without waiting for the next rebuild).
  const [liveCategories, setLiveCategories] = useState(generatedLive.categories || null);
  const [liveTools, setLiveTools] = useState(generatedLive.tools || null);

  useEffect(() => {
    fetchLiveCategories().then((c) => { if (c) setLiveCategories(c); });
    fetchLiveTools().then((t) => { if (t) setLiveTools(t); });
  }, []);

  const categories = useMemo(
    () => mergeBySlug(STATIC_CATEGORIES.map((c) => ({ ...c, slug: c.id })), liveCategories, 'slug'),
    [liveCategories],
  );
  const category = categories.find((c) => c.slug === categorySlug || c.id === categorySlug);

  const tools = useMemo(() => {
    const staticList = STATIC_TOOLS_BY_CATEGORY[categorySlug] || [];
    // Admin-created tools carry a `category_slug` column; static tools use
    // string category names, so match on the id form either way.
    const liveForCategory = (liveTools || []).filter(
      (t) => t.category_slug === categorySlug || t.category === category?.name,
    );
    const merged = mergeBySlug(staticList, liveForCategory, 'slug');
    return merged.map((t) => normalizeToolCategory(categorySlug, t));
  }, [categorySlug, liveTools, category]);

  if (!category) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: 'var(--col-text2)' }}>
        Category not found.
      </div>
    );
  }

  const [lead, ...rest] = category.name.split(' ');
  const accentWord = rest.join(' ') || 'Tools';

  return (
    <CategoryToolsPage
      leadWord={lead}
      accentWord={accentWord}
      description={category.description || category.desc}
      searchPlaceholder={`Search ${category.name.toLowerCase()}...`}
      crumbLabel={category.name}
      categories={CATEGORY_PILLS[categorySlug] || [{ id: 'all', name: 'All Tools' }]}
      tools={tools}
      icons={TOOL_ICONS}
      color={category.color || 'purple'}
    />
  );
}
