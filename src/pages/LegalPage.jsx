import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import PageShell from '../components/layout/PageShell.jsx';
import { LEGAL_PAGES } from '../data/legalContent.js';
import { fetchLivePage } from '../utils/publicApi.js';

export default function LegalPage({ pageKey }) {
  const params = useParams();
  const key = pageKey || params.slug;
  const page = LEGAL_PAGES[key];
  const [livePage, setLivePage] = useState(null);

  useEffect(() => {
    fetchLivePage(key).then((p) => { if (p && p.body) setLivePage(p); });
  }, [key]);

  if (!page) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl py-16 text-center text-neutral-500">Page not found.</div>
      </PageShell>
    );
  }

  const title = livePage?.title || page.title;

  return (
    <>
      <Head>
        <title>{title} — ImageYantra</title>
        <meta name="description" content={page.sub} />
      </Head>
      <PageShell>
        <div className="mx-auto max-w-3xl">
          <h1 className="font-head text-3xl font-extrabold text-neutral-900 sm:text-4xl">{title}</h1>
          {!livePage && <p className="mt-3 text-base text-neutral-500">{page.sub}</p>}

          {livePage ? (
            // Admin-edited content — plain text/simple HTML, one paragraph per blank-separated block.
            <div className="mt-8 space-y-4 leading-relaxed text-neutral-700">
              {livePage.body.split(/\n{2,}/).map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\n/g, '<br />') }} />
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {page.sections.map((s) => (
                <section key={s.h}>
                  <h2 className="text-xl font-bold text-neutral-900">{s.h}</h2>
                  {s.p && s.p.map((para, i) => (
                    <p key={i} className="mt-3 leading-relaxed text-neutral-700">{para}</p>
                  ))}
                  {s.list && (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-neutral-700">
                      {s.list.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}