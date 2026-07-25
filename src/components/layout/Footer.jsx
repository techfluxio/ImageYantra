import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, MailIcon } from '../../utils/icons.jsx';
import { BLOG_POSTS } from '../../data/index.js';
import { fetchLiveFooterLinks } from '../../utils/publicApi.js';
import logoMark from '../../assets/images/logo-64.png';

export default function Footer() {
  const navigate = useNavigate();
  const [liveLinks, setLiveLinks] = useState(null);

  useEffect(() => {
    fetchLiveFooterLinks().then((rows) => { if (rows && rows.length) setLiveLinks(rows); });
  }, []);

  const staticColumns = [
    {
      title: 'ImageYantra',
      links: [
        { label: 'About Us',         path: '/about' },
        { label: 'Blog',             path: '/blog' },
        { label: 'Privacy Policy',   path: '/privacy' },
        { label: 'Terms of Service', path: '/terms'   },
        { label: 'Disclaimer',       path: '/disclaimer' },
        { label: 'Sitemap',          path: '/sitemap.xml', external: true },
      ],
    },
    {
      title: 'Categories',
      links: [
        { label: 'Image Tools',      path: '/image-tools'   },
        { label: 'PDF Tools',        path: '/pdf-tools'     },
        { label: 'Exam Tools',       path: '/exam-tools'    },
        { label: 'ID Photo Sizes',   path: '/id-photo-sizes' },
      ],
    },
    {
      title: 'Popular Tools',
      links: [
        { label: 'Compress Image',   path: '/tools/compress-image'    },
        { label: 'Resize Image',     path: '/tools/resize-image'      },
        { label: 'Compress PDF',     path: '/tools/compress-pdf'      },
        { label: 'Merge PDF',        path: '/tools/merge-pdf'         },
        { label: 'JPG to PDF',       path: '/tools/jpg-to-pdf'        },
        { label: 'Remove Background',path: '/tools/background-remove' },
      ],
    },
    {
      title: 'Latest from Blog',
      links: BLOG_POSTS.slice(0, 4).map((p) => ({
        label: p.title.length > 36 ? p.title.slice(0, 36) + '…' : p.title,
        path:  `/blog/${p.slug}`,
      })),
    },
  ];

  // If the admin has configured footer links in Supabase, group them by
  // group_name/group_sort into the same column shape the static list uses.
  // The "Latest from Blog" column always stays dynamic (driven by actual
  // blog posts) regardless, since a stale hand-edited list of blog links
  // would drift out of sync with what's actually published.
  const blogColumn = staticColumns[staticColumns.length - 1];
  let columns = staticColumns;
  if (liveLinks) {
    const byGroup = new Map();
    for (const link of liveLinks) {
      if (!byGroup.has(link.group_name)) byGroup.set(link.group_name, { title: link.group_name, sort: link.group_sort, links: [] });
      byGroup.get(link.group_name).links.push({ label: link.label, path: link.url, external: link.external });
    }
    columns = [
      ...Array.from(byGroup.values()).sort((a, b) => (a.sort || 0) - (b.sort || 0)),
      blogColumn,
    ];
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand column */}
          <div>
            <div className="footer__brand-logo">
              <img src={logoMark} alt="ImageYantra" width={34} height={34} style={{ objectFit: 'contain', flexShrink: 0 }} />
              <span className="footer__brand-name">
                Image<em>Yantra</em>
              </span>
            </div>
            <p className="footer__tagline">
              A premium suite of image, PDF, exam and document tools. Fast, private, and always free.
            </p>
            <div className="footer__privacy-note">
              <ShieldIcon size={15} style={{ color: 'var(--col-accent)', flexShrink: 0 }} />
              <span>Your files never leave your device.</span>
            </div>
            <div style={{ marginTop: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['contact@imageyantra.in', 'business@imageyantra.in'].map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="footer__link"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <MailIcon size={14} style={{ opacity: 0.5 }} />
                  {email}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div className="footer__col-title">{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {col.links.map((link) =>
                  link.external ? (
                    <a key={link.path} href={link.path} className="footer__link" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <button key={link.path} className="footer__link" onClick={() => navigate(link.path)}>
                      {link.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} ImageYantra. All rights reserved.</span>
          <div className="footer__bottom-links">
            {[
              { label: 'Privacy Policy',   path: '/privacy'    },
              { label: 'Terms of Service', path: '/terms'      },
              { label: 'Disclaimer',       path: '/disclaimer' },
              { label: 'Sitemap',          path: '/sitemap.xml', external: true },
            ].map((link) =>
              link.external ? (
                <a key={link.path} href={link.path} className="footer__bottom-link" target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <button key={link.path} className="footer__bottom-link" onClick={() => navigate(link.path)}>
                  {link.label}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
