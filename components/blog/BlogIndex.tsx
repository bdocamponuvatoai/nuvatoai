import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteFooter from '@/components/home/SiteFooter';
import { blogCategories, blogIndex, blogPosts, formatPostDate, type BlogPost } from '@/lib/blog';
import BlogCta from './BlogCta';
import BlogHeader from './BlogHeader';

const number = (index: number) => String(index + 1).padStart(2, '0');

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <span className="mono blog-meta">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      {post.readingTime} min read
    </span>
  );
}

/** The newest post, large, overlapping the hero like the homepage's command center. */
function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="blog-feature">
      <div className="blog-feature-media">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          width={post.image.width}
          height={post.image.height}
          unoptimized
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="blog-feature-body">
        <div className="blog-feature-labels">
          <span className="blog-chip">Latest guide</span>
          <span className="mono">{post.category}</span>
        </div>
        <h2>
          {/* The link covers the whole card (see .blog-feature h2 a::after). */}
          <Link href={post.path}>{post.title}</Link>
        </h2>
        <p>{post.description}</p>
        <div className="blog-feature-foot">
          <PostMeta post={post} />
          <span className="blog-feature-cta" aria-hidden="true">
            Read the guide
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogIndex() {
  const [featured, ...earlier] = blogPosts;

  return (
    <>
      <BlogHeader />
      <main id="blog-main" className="blog-page">
        <section className="panel blog-hero blog-index-hero" data-nav-tone="dark">
          <div className="hero-light" aria-hidden="true" />
          <div className="horizon-rings" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="blog-hero-content">
            <p className="category-pill mono">{['Blog', ...blogCategories].join(' · ')}</p>
            <h1>
              {blogIndex.heading} <em>{blogIndex.emphasis}</em>
            </h1>
            <p className="blog-hero-dek">{blogIndex.description}</p>
          </div>
        </section>

        {featured && (
          <section className="container blog-featured" aria-label="Latest guide">
            <FeaturedPost post={featured} />
          </section>
        )}

        {earlier.length > 0 && (
          <section className="container blog-archive" aria-labelledby="blog-archive-title">
            <p id="blog-archive-title" className="eyebrow">
              EARLIER GUIDES
            </p>
            <ol className="blog-rows">
              {earlier.map((post, index) => (
                <li key={post.slug}>
                  <span className="mono blog-row-number" aria-hidden="true">
                    {number(index + 1)}
                  </span>
                  <h2>
                    <Link href={post.path}>{post.title}</Link>
                  </h2>
                  <p>{post.description}</p>
                  <PostMeta post={post} />
                  <ArrowUpRight className="blog-row-arrow" size={18} aria-hidden="true" />
                </li>
              ))}
            </ol>
          </section>
        )}

        <BlogCta />
      </main>
      <SiteFooter hrefBase="/" />
    </>
  );
}
