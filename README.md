# ImageYantra Frontend v2

A premium, production-ready frontend for ImageYantra — a free online suite of image, PDF, exam and government document tools.

---

## Tech Stack

| Layer       | Library / Tool          |
|-------------|-------------------------|
| Framework   | React 18                |
| Routing     | React Router DOM v6     |
| Build tool  | Vite 5                  |
| SEO         | react-helmet-async      |
| Styling     | Plain CSS + CSS Variables |
| Icons       | Inline SVG (zero-dep)   |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
imageyantra-frontend/
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── assets/
│   │   └── images/            # Static images, OG image
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.jsx  # Nav bar + 3 mega menus + mobile drawer
│   │   │   ├── Footer.jsx      # 4-column footer
│   │   │   └── (AdColumn is in cards/index.jsx)
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.jsx      # Design-system button (5 variants, 3 sizes)
│   │   │   └── index.jsx       # Badge, Breadcrumb, FAQAccordion, SectionLabel, etc.
│   │   │
│   │   ├── cards/
│   │   │   └── index.jsx       # AdColumn, ToolCard, ExamCard, BlogCard, CategoryCard
│   │   │
│   │   ├── sections/
│   │   │   └── index.jsx       # Hero, CategoriesGrid, PopularTools, ExamSection,
│   │   │                       # LatestTools, BlogSection, TrustSection, FAQSection
│   │   │
│   │   └── tool/
│   │       └── index.jsx       # UploadZone, ProcessingState, ToolResult,
│   │                           # HowItWorks, RelatedTools
│   │
│   ├── data/
│   │   ├── imageTools.js       # 6 image tools with FAQs
│   │   ├── pdfTools.js         # 5 PDF tools with FAQs
│   │   ├── exams.js            # 25+ exams with full specs
│   │   ├── examGroups.js       # 9 authority groups (NTA, IIT, SSC…)
│   │   └── index.js            # Categories, blog posts, convert tools,
│   │                           # govt tools, popular tools, popular chips, FAQs
│   │
│   ├── hooks/
│   │   ├── useSearch.js        # Debounced search with autocomplete state
│   │   └── useOutsideClick.js  # Dropdown close on outside click
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── CategoryPage.jsx    # Shared layout for all category pages
│   │   ├── ToolCategoryPages.jsx # ImageToolsPage, PDFToolsPage, etc.
│   │   ├── ExamToolsPage.jsx   # Grouped by authority with filter tabs
│   │   ├── ExamDetailPage.jsx  # JEE Main / NEET style with tool cards
│   │   ├── ToolPage.jsx        # Upload UI + sticky ads + FAQs + related tools
│   │   └── BlogPages.jsx       # BlogListPage + BlogPostPage
│   │
│   ├── styles/
│   │   ├── tokens.css          # All CSS custom properties (design system)
│   │   ├── global.css          # Reset, layout utils, section patterns
│   │   ├── animations.css      # Keyframes, animation classes, drawer, mega menu
│   │   ├── components.css      # Every component's styles
│   │   └── responsive.css      # All breakpoints (1280 → 380px)
│   │
│   ├── utils/
│   │   ├── icons.jsx           # 30+ SVG icon components + getToolIcon()
│   │   └── helpers.js          # formatFileSize, searchItems, getExamBySlug, etc.
│   │
│   ├── App.jsx                 # Root component with route definitions
│   └── main.jsx                # Entry point — imports styles, renders App
│
├── index.html                  # Shell with fonts, AdSense, SEO meta, Schema.org
├── vite.config.js
├── package.json
└── README.md
```

---

## Adding a New Tool

1. Add an entry to `src/data/imageTools.js` (or the relevant data file):

```js
{
  slug: 'my-tool',
  name: 'My Tool',
  desc: 'Short description shown on cards.',
  longDesc: 'Full description shown on the tool page.',
  icon: 'compress',   // key from src/utils/icons.jsx
  category: 'Image Tools',
  accept: 'image/*',
  faqs: [
    { q: 'Question?', a: 'Answer.' },
  ],
}
```

2. The tool automatically appears in:
   - Category page grid
   - Navigation mega menu
   - Search autocomplete
   - Related tools section
   - Footer popular tools (if added to `POPULAR_TOOLS` in `index.js`)

No other code changes needed.

---

## Adding a New Exam

Add an entry to `src/data/exams.js`:

```js
{
  slug: 'my-exam',
  name: 'My Exam',
  authority: 'Authority Label',  // shown as badge
  authorityId: 'nta',            // must match an id in examGroups.js
  desc: 'Short description.',
  tools: ['Photograph Resizer', 'Signature Resizer'],
  photo: { format: 'JPG / JPEG', size: '10 – 200 KB', dims: '3.5 × 4.5 cm' },
  signature: { format: 'JPG / JPEG', size: '4 – 30 KB' },
}
```

The exam auto-appears on the Exam Tools page, in the navigation mega menu, and in search results.

---

## Design System

All design tokens live in `src/styles/tokens.css` as CSS custom properties.

Key variables:

```css
--col-accent:   #8133E0   /* Brand purple       */
--col-bg:       #F4F3FB   /* Page background     */
--col-text:     #0D0B1A   /* Primary text        */
--col-text2:    #56507A   /* Secondary text      */
--ff-head:      'Syne'    /* Heading font        */
--ff-body:      'DM Sans' /* Body font           */
--nav-h:        64px      /* Navigation height   */
--content-w:    1200px    /* Max content width   */
```

---

## Advertisement Placement

Sticky side ads appear **only on desktop (≥1280px)** and **only on Tool and Blog pages**.

To add a real AdSense unit, replace the `slot` prop on `<AdColumn slot="XXXXXXXXXX" />` in:
- `src/pages/ToolPage.jsx` (left + right)
- `src/pages/BlogPages.jsx` (left + right)

The `ins.adsbygoogle` element is already rendered inside `AdColumn`. The AdSense script is loaded in `index.html`.

---

## SEO

- Every page has a unique `<title>` and `<meta name="description">` via `react-helmet-async`.
- Tool pages include `SoftwareApplication` Schema.org JSON-LD.
- Blog posts include `BlogPosting` Schema.org JSON-LD.
- Exam pages include `FAQPage` Schema.org JSON-LD.
- Homepage includes `WebSite` + `SearchAction` Schema.org JSON-LD.
- Canonical URLs are set on every page.
- `robots.txt` is included in `public/`.

---

## Responsive Breakpoints

| Breakpoint      | Behaviour                              |
|-----------------|----------------------------------------|
| ≥1280px         | Full layout with sticky side ads       |
| 1024–1279px     | Ads hidden; 3-col grids               |
| 900–1023px      | Mobile nav; 2-col grids               |
| 768–899px       | Collapsed sections; single-col grids  |
| ≤640px          | Full single-column; chips scroll       |
| ≤380px          | Compact nav logo; larger touch targets |

---

## Environment Variables

Create `.env` in the project root:

```env
VITE_ADSENSE_PUB_ID=ca-pub-2178808063904703
VITE_SITE_URL=https://imageyantra.in
```

---

© 2026 ImageYantra. All rights reserved.
