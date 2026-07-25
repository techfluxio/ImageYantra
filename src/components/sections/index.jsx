import { useNavigate } from 'react-router-dom';
import { ToolCard, ExamCard, BlogCard, CategoryCard, MiniToolCard, MostUsedItem, AdPlaceholderCard } from '../cards/index.jsx';
import { SectionLabel } from '../ui/index.jsx';
import { FAQAccordion } from '../ui/index.jsx';
import { ShieldIcon, BoltIcon, CheckIcon, MobileIcon, ExtLinkIcon, getToolIcon, ImagesStackIcon, CompressPdfIcon, GraduationCapIcon, UsersIcon, ChatIcon, PlusIcon, HelpCircleIcon, NewspaperIcon, ClockIcon } from '../../utils/icons.jsx';
import { CATEGORIES, POPULAR_TOOLS, BLOG_POSTS, FAQS, GOVT_TOOLS } from '../../data/index.js';
import { EXAMS } from '../../data/exams.js';
import { IMAGE_TOOLS } from '../../data/imageTools.js';
import { PDF_TOOLS } from '../../data/pdfTools.js';
import { SOCIAL_TOOLS } from '../../data/socialTools.js';
import { OTHER_TOOLS } from '../../data/otherTools.js';
import { blogCategoryClass } from '../../utils/helpers.js';

/* ── Categories Grid ─────────────────────────────────── */
export function CategoriesGrid() {
  return (
    <section id="categories" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-10)' }}>
      <div className="container">
        <h2 className="font-head" style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-5)' }}>
          Choose Category
        </h2>
        <div className="grid-cats">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} delay={(i % 4) + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Popular Tools ───────────────────────────────────── */
export function PopularTools() {
  return (
    <section className="section section--white">
      <div className="container">
        <div className="section__header">
          <div>
            <SectionLabel>Most loved</SectionLabel>
            <h2 className="section__title font-head">Popular tools</h2>
            <p className="section__sub" style={{ marginBottom: 0 }}>The tools people reach for every single day.</p>
          </div>
        </div>
        <div className="grid-tools">
          {POPULAR_TOOLS.map((t, i) => (
            <ToolCard key={t.slug} tool={t} delay={(i % 3) + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Most Used — compact icon-shortcut row ──────────────── */
const MOST_USED_TONES = ['red', 'purple', 'sky', 'green', 'pink', 'red', 'green', 'purple'];
export function MostUsedSection() {
  const navigate = useNavigate();
  const items = POPULAR_TOOLS.slice(0, 8);
  return (
    <section style={{ paddingBottom: 'var(--sp-10)' }}>
      <div className="container">
        <h2 className="font-head" style={{ fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--sp-5)' }}>
          Most Used
        </h2>
        <div className="most-used-row" style={{ justifyContent: 'flex-start' }}>
          {items.map((t, i) => (
            <MostUsedItem
              key={t.slug}
              icon={getToolIcon(t.icon, 24)}
              name={t.name}
              tone={MOST_USED_TONES[i % MOST_USED_TONES.length]}
              onClick={() => navigate(`/tools/${t.slug}`)}
              delay={(i % 4) + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Colored tool-grid bands (Image / PDF / Exam / ID / Social / Other) ───── */
function ToolGridBand({ colorClass, tone, icon, title, count, viewAllPath, items }) {
  const navigate = useNavigate();
  return (
    <div className={`tool-grid-band ${colorClass}`}>
      <div className="tool-grid-band__head">
        <span className="icon-box">{icon}</span>
        <h3>{title}</h3>
        <a onClick={() => navigate(viewAllPath)}>View all <ExtLinkIcon size={11} /></a>
      </div>
      <div className="tool-grid-band__grid">
        {items.map((it, i) => (
          <MiniToolCard
            key={it.key}
            icon={it.icon}
            name={it.name}
            sub={it.sub}
            tone={tone}
            onClick={it.onClick}
            delay={(i % 5) + 1}
          />
        ))}
      </div>
    </div>
  );
}

export function ToolGridBands() {
  const navigate = useNavigate();

  const imageItems = IMAGE_TOOLS.slice(0, 10).map((t) => ({
    key: t.slug, icon: getToolIcon(t.icon, 18), name: t.name,
    sub: t.desc?.split('.')[0]?.slice(0, 28), onClick: () => navigate(`/tools/${t.slug}`),
  }));
  const pdfItems = PDF_TOOLS.slice(0, 10).map((t) => ({
    key: t.slug, icon: getToolIcon(t.icon, 18), name: t.name,
    sub: t.desc?.split('.')[0]?.slice(0, 28), onClick: () => navigate(`/tools/${t.slug}`),
  }));
  const examItems = EXAMS.slice(0, 10).map((e) => ({
    key: e.slug, icon: getToolIcon('exam', 18), name: e.name,
    sub: e.authority, onClick: () => navigate(`/exam-tools/${e.slug}`),
  }));
  const govtItems = GOVT_TOOLS.map((t) => ({
    key: t.slug, icon: getToolIcon(t.icon, 18), name: t.name,
    sub: t.desc?.split('.')[0]?.slice(0, 28), onClick: () => navigate(`/tools/${t.slug}`),
  }));
  const socialItems = SOCIAL_TOOLS.map((t) => ({
    key: t.slug, icon: getToolIcon(t.icon, 18), name: t.name,
    sub: t.dims, onClick: () => navigate(`/tools/${t.slug}`),
  }));
  const otherItems = OTHER_TOOLS.map((t) => ({
    key: t.slug, icon: getToolIcon(t.icon, 18), name: t.name,
    sub: t.desc?.split('.')[0]?.slice(0, 28), onClick: () => navigate(`/tools/${t.slug}`),
  }));

  return (
    <section style={{ paddingBottom: 'var(--sp-4)' }}>
      <div className="container">
        <ToolGridBand
          colorClass="tool-grid-band--purple"
          tone="purple"
          icon={<ImagesStackIcon size={18} />}
          title="Image Tools"
          viewAllPath="/image-tools"
          items={imageItems}
        />
        <ToolGridBand
          colorClass="tool-grid-band--red"
          tone="red"
          icon={<CompressPdfIcon size={18} />}
          title="PDF Tools"
          viewAllPath="/pdf-tools"
          items={pdfItems}
        />
        <ToolGridBand
          colorClass="tool-grid-band--green"
          tone="green"
          icon={<GraduationCapIcon size={18} />}
          title="Exam Tools"
          viewAllPath="/exam-tools"
          items={examItems}
        />
        <ToolGridBand
          colorClass="tool-grid-band--blue"
          tone="blue"
          icon={<UsersIcon size={18} />}
          title="ID Photo Sizes"
          viewAllPath="/id-photo-sizes"
          items={govtItems}
        />
        <ToolGridBand
          colorClass="tool-grid-band--yellow"
          tone="yellow"
          icon={<ChatIcon size={18} />}
          title="Social Tools"
          viewAllPath="/social-tools"
          items={socialItems}
        />
        <ToolGridBand
          colorClass="tool-grid-band--black"
          tone="black"
          icon={<PlusIcon size={18} />}
          title="Other Tools"
          viewAllPath="/other-tools"
          items={otherItems}
        />
      </div>
    </section>
  );
}

/* ── Exam Section ────────────────────────────────────── */
export function ExamSection() {
  const navigate = useNavigate();
  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <div style={{ maxWidth: 600 }}>
            <SectionLabel>Exam Ready</SectionLabel>
            <h2 className="section__title font-head">Built for India's most important exams</h2>
            <p style={{ fontSize: 16, color: 'var(--col-text2)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--sp-3)' }}>
              Official photo, signature &amp; document specs — preconfigured. We maintain exact requirements for {EXAMS.length}+ examinations so you don't have to look them up.
            </p>
          </div>
          <button
            className="btn btn--accent-outline btn--sm"
            onClick={() => navigate('/exam-tools')}
            style={{ alignSelf: 'flex-start', marginTop: 'var(--sp-2)', flexShrink: 0 }}
          >
            View all exams <ExtLinkIcon size={12} />
          </button>
        </div>
        <div className="grid-exams">
          {EXAMS.slice(0, 8).map((exam, i) => (
            <ExamCard key={exam.slug} exam={exam} delay={(i % 4) + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Blog Section ────────────────────────────────────── */
export function BlogSection() {
  const navigate = useNavigate();
  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <div>
            <SectionLabel>Read</SectionLabel>
            <h2 className="section__title font-head">From the blog</h2>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => navigate('/blog')}
            style={{ color: 'var(--col-accent)', alignSelf: 'flex-end' }}
          >
            View all posts <ExtLinkIcon size={12} />
          </button>
        </div>
        <div className="grid-blog">
          {BLOG_POSTS.slice(0, 3).map((post, i) => (
            <BlogCard key={post.slug} post={post} delay={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trust / Why Us Section ──────────────────────────── */
const TRUST_FEATURES = [
  { Icon: ShieldIcon, title: '100% Private', text: 'Your files never leave your device. All processing happens locally using modern Web APIs — Canvas, WebAssembly, and FileReader.' },
  { Icon: BoltIcon,   title: 'Instant Results', text: 'No waiting for uploads or server processing. Results appear in real time — most tools complete in under a second.' },
  { Icon: CheckIcon,  title: 'Always Free', text: 'Every tool is completely free with no hidden limits, no file size restrictions, and no watermarks on your output.' },
  { Icon: MobileIcon, title: 'Works Everywhere', text: 'Fully responsive and touch-optimized. Use from any phone, tablet, laptop, or desktop — no app required.' },
];

export function TrustSection() {
  return (
    <section className="section section--white">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <SectionLabel>Why ImageYantra</SectionLabel>
          <h2 className="section__title font-head">Built for speed, privacy &amp; simplicity</h2>
        </div>
        <div className="grid-features">
          {TRUST_FEATURES.map((f, i) => (
            <div key={i} className={`anim-fade-up d${i + 1}`} style={{ padding: 'var(--sp-7)', borderRadius: 'var(--r-lg)', border: '1px solid var(--col-border)', background: 'var(--col-bg)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--col-accent-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--col-accent)', marginBottom: 'var(--sp-4)' }}>
                <f.Icon size={20} />
              </div>
              <div className="font-head" style={{ fontSize: 16, fontWeight: 700, color: 'var(--col-text)', marginBottom: 'var(--sp-2)' }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'var(--col-text2)', lineHeight: 'var(--lh-relaxed)' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Compact FAQ + Recent Blogs (homepage bottom, matches reference layout) ── */
export function HomeFAQAndBlog() {
  const navigate = useNavigate();
  return (
    <div className="home-faq-blog">
      <div className="home-faq-blog__panel">
        <div className="home-faq-blog__head">
          <div className="home-faq-blog__head-left">
            <span className="home-faq-blog__icon" style={{ background: 'var(--col-accent-xl)', color: 'var(--col-accent)' }}>
              <HelpCircleIcon size={18} />
            </span>
            <div>
              <div className="home-faq-blog__title">Frequently asked questions</div>
              <div className="home-faq-blog__sub">Everything you need to know about ImageYantra.</div>
            </div>
          </div>
        </div>
        <FAQAccordion items={FAQS.slice(0, 5)} />
      </div>

      <div className="home-faq-blog__panel">
        <div className="home-faq-blog__head">
          <div className="home-faq-blog__head-left">
            <span className="home-faq-blog__icon" style={{ background: 'var(--col-amber-bg)', color: 'var(--col-amber)' }}>
              <NewspaperIcon size={18} />
            </span>
            <div className="home-faq-blog__title">Recent blogs</div>
          </div>
          <a className="home-faq-blog__link" onClick={() => navigate('/blog')}>
            All posts <ExtLinkIcon size={11} />
          </a>
        </div>
        {BLOG_POSTS.slice(0, 3).map((post) => (
          <div key={post.slug} className="home-blog-item" onClick={() => navigate(`/blog/${post.slug}`)} role="button" tabIndex={0}>
            <div className="home-blog-item__meta">
              <span className={`badge ${blogCategoryClass(post.category)} home-blog-item__tag`}>{post.category}</span>
              <span className="home-blog-item__date"><ClockIcon size={11} style={{ verticalAlign: '-2px', marginRight: 3 }} />{post.date}</span>
              <span className="home-blog-item__date">· {post.readTime} min read</span>
            </div>
            <div className="home-blog-item__title">{post.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function FAQSection() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="section__title font-head">Questions, answered</h2>
          </div>
          <FAQAccordion items={FAQS} />
        </div>
      </div>
    </section>
  );
}
