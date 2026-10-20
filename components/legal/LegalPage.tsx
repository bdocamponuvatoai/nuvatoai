import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { legalDocuments, legalMeta, type LegalDocument } from '@/lib/legal-content';

const legalHref = (slug: string) => `/${slug}/`;

export function LegalHeader() {
  return (
    <>
      <a className="skip-link" href="#legal-main">
        Skip to content
      </a>
      <header className="navigation-shell legal-header" data-tone="light">
        <div className="navigation-bar">
          <BrandLogo href="/" />
          <nav className="navigation-legal" aria-label="Legal navigation">
            <Link href="/terms/">Privacy & terms</Link>
            <Link href="/" className="navigation-legal-back">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to website
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function LegalFooter() {
  return (
    <footer className="legal-footer section-shell">
      <p>© {new Date().getFullYear()} Nuvato AI · Chicago, Illinois, USA. All rights reserved.</p>
      <nav aria-label="Legal pages">
        {legalDocuments.map((document) => (
          <Link key={document.slug} href={legalHref(document.slug)}>
            {document.title}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

const TOKEN = /(\[[^\]]+\]\([^)]+\)|[\w.+-]+@[\w-]+\.[\w.]+\w)/;
const MARKDOWN_LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Renders legal copy, turning `[label](href)` and email addresses into links. */
function LegalText({ text }: { text: string }) {
  return text.split(TOKEN).map((part, i) => {
    // split() with a capture group alternates plain text (even) and matches (odd).
    if (i % 2 === 0) return part;

    const link = part.match(MARKDOWN_LINK);
    if (!link)
      return (
        <a key={i} href={`mailto:${part}`}>
          {part}
        </a>
      );

    const [, label, href] = link;
    return href.startsWith('http') ? (
      <a key={i} href={href} rel="noopener noreferrer">
        {label}
      </a>
    ) : (
      <Link key={i} href={href}>
        {label}
      </Link>
    );
  });
}

export default function LegalPage({ document }: { document: LegalDocument }) {
  const effective = document.effective ?? legalMeta.effective;
  const updated = document.updated ?? legalMeta.updated;

  return (
    <>
      <LegalHeader />
      <main id="legal-main" className="section-shell legal-main">
        <div className="legal-breadcrumb">
          <Link href="/terms/">Privacy & terms</Link>
          <span>/</span>
          {document.title}
        </div>

        <div className="legal-title">
          <p className="eyebrow">
            <span />
            {document.eyebrow}
          </p>
          <h1>{document.title}</h1>
          <p>{document.description}</p>
          <span className="legal-version">
            Effective {effective} · Last updated {updated} · Version {legalMeta.version}
          </span>
        </div>

        <div className="legal-summary">
          {document.summary.map((item, i) => (
            <article key={item.title}>
              <span>0{i + 1}</span>
              <h2>{item.title}</h2>
              <p>
                <LegalText text={item.text} />
              </p>
            </article>
          ))}
        </div>

        <div className="legal-layout">
          <aside className="legal-toc">
            <h2>On this page</h2>
            <nav aria-label="Table of contents">
              {document.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title.replace(/^\d+\. /, '')}
                </a>
              ))}
            </nav>
            <div className="legal-toc-note">
              <ShieldCheck size={18} />
              <p>Privacy and consent should be clear before you share information.</p>
            </div>
          </aside>

          <article className="legal-copy">
            {document.sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.highlight && (
                  <p className="legal-highlight">
                    <LegalText text={section.highlight} />
                  </p>
                )}
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>
                    <LegalText text={paragraph} />
                  </p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>
                        <LegalText text={bullet} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="legal-related">
              <h2>Related pages</h2>
              {legalDocuments
                .filter((other) => other.slug !== document.slug)
                .map((other) => (
                  <Link key={other.slug} href={legalHref(other.slug)}>
                    {other.title}
                    <ArrowUpRight size={17} />
                  </Link>
                ))}
            </div>
          </article>
        </div>
      </main>
      <LegalFooter />
    </>
  );
}
