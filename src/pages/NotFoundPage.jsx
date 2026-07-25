import { Head } from 'vite-react-ssg';

/* ── 404 Page ────────────────────────────────────────── */
export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found — ImageYantra</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
      style={{
        paddingTop: 'var(--nav-h)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--col-bg)',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--ff-head)',
            fontSize: 80,
            fontWeight: 800,
            color: 'var(--col-accent)',
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h1
          className="font-head"
          style={{ fontSize: 28, fontWeight: 700, color: 'var(--col-text)', marginBottom: 12 }}
        >
          Page not found
        </h1>
        <p style={{ fontSize: 16, color: 'var(--col-text2)', marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn btn--primary btn--md">
          Back to Home
        </a>
      </div>
    </main>
    </>
  );
}
