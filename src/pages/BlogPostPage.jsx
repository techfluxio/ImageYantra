import { useParams, Link, Navigate } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Clock } from 'lucide-react';
import { BLOG_POSTS } from '../data/index.js';
import PageShell from '../components/layout/PageShell.jsx';
import { blogCategoryClass } from '../utils/helpers.js';
import { useLiveBlogPost } from '../hooks/useLiveBlog.js';

export default function BlogPostPage() {
  const { slug } = useParams();
  const staticPost = BLOG_POSTS.find((p) => p.slug === slug) || null;
  const { post, liveBody, loading } = useLiveBlogPost(slug, staticPost);

  // Only bounce to /blog once we've actually checked Supabase and there's
  // still no post anywhere (static or live) — otherwise a brand-new,
  // admin-only post gets redirected away before the live fetch resolves.
  if (!post && !loading) return <Navigate to="/blog" replace />;
  if (!post) return null;

  const readTime = post.readTime ?? post.read_time ?? 4;

  return (
    <>
      <Head>
        <title>{post.title} — ImageYantra Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <PageShell className="max-w-3xl">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-violet-600">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-violet-600">Blog</Link>
          <span>›</span>
          <span className="text-neutral-700">{post.title}</span>
        </nav>

        <span className={`badge ${blogCategoryClass(post.category)}`}>{post.category} Tools</span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-neutral-900 md:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-3 border-b border-neutral-100 pb-4 text-sm text-neutral-500">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
            {post.author.charAt(0)}
          </div>
          <span className="font-medium text-neutral-700">{post.author}</span>
          <span>·</span>
          <span>{post.date}</span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {readTime} min read
          </span>
        </div>

        <p className="mt-6 text-lg text-neutral-700">{post.excerpt}</p>

        {liveBody ? (
          <div className="prose prose-neutral mt-6 max-w-none whitespace-pre-line">
            {liveBody}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500">
            Full article content for this post hasn't been written yet — this page is a placeholder
            so the blog listing links resolve correctly.
          </div>
        )}
      </PageShell>
    </>
  );
}