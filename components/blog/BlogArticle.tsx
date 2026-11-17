import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronDown, Sparkles } from 'lucide-react';
import SiteFooter from '@/components/home/SiteFooter';
import { images } from '@/lib/assets';
import { blogPostStructuredData, emphasizeEnd, formatPostDate, type BlogPost } from '@/lib/blog';
import { siteOrigin } from '@/lib/seo';
import BlogCta from './BlogCta';
import BlogHeader from './BlogHeader';
import BlogShare from './BlogShare';
import BlogToc from './BlogToc';
import { blogMdxComponents, headingsOf } from './mdx';

const TRUST = ['Scoped first', 'Fixed price before work starts', 'Reply within one business day'];

export default function BlogArticle({ post }: { post: BlogPost }) {
  const { Content, image } = post;
  const headings = headingsOf(Content);
  const title = emphasizeEnd(post.title);
  /** JSON-LD is data, not script, so it needs no CSP nonce. `<` is escaped to keep it inert. */
  const jsonLd = JSON.stringify(blogPostStructuredData(post)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <BlogHeader />
      <main id="blog-main" className="blog-page">
        <article className="blog-post">
          <header className="panel blog-hero blog-post-hero" data-nav-tone="dark">
            <div className="hero-light" aria-hidden="true" />
            <div className="horizon-rings" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="blog-hero-content">
              <nav className="category-pill mono blog-crumbs" aria-label="Breadcrumb">
                <Link href="/blog/">Blog</Link>
                <span aria-hidden="true">/</span>
                <span>{post.category}</span>
              </nav>
              <h1>
                {title.lead} <em>{title.emphasis}</em>
              </h1>
              <p className="blog-hero-dek">{post.description}</p>
              {/* Two groups, so a narrow screen breaks the line between them, not mid-list. */}
              <div className="blog-byline">
                <span className="blog-byline-group">
                  <span className="blog-byline-mark">
                    <Image src={images.brandMark} width={26} height={26} alt="" />
                  </span>
                  <span>
                    By <strong>{post.author}</strong>
                  </span>
                </span>
                <span className="blog-byline-dot blog-byline-split" aria-hidden="true" />
                <span className="blog-byline-group">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  {post.dateModified !== post.date && (
                    <>
                      <span className="blog-byline-dot" aria-hidden="true" />
                      <span>
                        Updated{' '}
                        <time dateTime={post.dateModified}>
                          {formatPostDate(post.dateModified)}
                        </time>
                      </span>
                    </>
                  )}
                  <span className="blog-byline-dot" aria-hidden="true" />
                  <span>{post.readingTime} min read</span>
                </span>
              </div>
            </div>
          </header>

          <figure className="container blog-figure">
            <div className="blog-figure-frame">
              {/*
                Served as the exact uploaded file: ImageKit's resizing would strip the embedded
                title, alt text, and AI-generated marker (IPTC digital source type).
              */}
              <Image
                src={image.url}
                alt={image.alt}
                width={image.width}
                height={image.height}
                unoptimized
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <figcaption>
              <span>{image.caption}</span>
              {image.aiDisclosure && (
                <span className="blog-ai-note">
                  <span className="blog-ai-badge">
                    <Sparkles size={12} aria-hidden="true" />
                    AI image
                  </span>
                  {image.aiDisclosure}
                </span>
              )}
            </figcaption>
          </figure>

          <div className="container blog-layout">
            <aside className="blog-aside">
              <div className="blog-aside-sticky">
                <BlogToc headings={headings} />
                <div className="blog-aside-cta">
                  <ul>
                    {TRUST.map((item) => (
                      <li key={item}>
                        <Check size={13} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/#contact" className="navigation-cta">
                    Book a call
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </aside>

            <div className="blog-body">
              <details className="blog-toc-mobile">
                <summary>
                  <span className="mono">ON THIS PAGE</span>
                  <span>{headings.length} sections</span>
                  <ChevronDown size={17} aria-hidden="true" />
                </summary>
                <ol>
                  {headings.map(({ id, text }, index) => (
                    <li key={id}>
                      <a href={`#${id}`}>
                        <span className="mono" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>

              <div
                className="blog-copy"
                style={
                  {
                    '--blog-sections': `'${String(headings.length).padStart(2, '0')}'`,
                  } as CSSProperties
                }
              >
                <Content components={blogMdxComponents} />
              </div>

              <footer className="blog-post-end">
                <div className="blog-author">
                  <span className="blog-author-mark">
                    <Image src={images.brandMark} width={40} height={40} alt="" />
                  </span>
                  <div>
                    <span className="mono">WRITTEN BY</span>
                    <strong>{post.author}</strong>
                    <Link href="/#why">
                      About {post.author}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <BlogShare url={siteOrigin + post.path} title={post.title} />
              </footer>
            </div>
          </div>
        </article>

        <BlogCta />
      </main>
      <SiteFooter hrefBase="/" />
    </>
  );
}
