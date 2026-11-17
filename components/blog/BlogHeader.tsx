'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { blogNavigation, navigationDestinations } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

/** Matches the drawer's exit animation in navigation.css. */
const DRAWER_EXIT_MS = 220;

const links = [
  { href: '/#services', label: 'Services', description: 'Five services. One partner.' },
  ...navigationDestinations.map(({ id, label, description }) => ({
    href: `/#${id}`,
    label,
    description,
  })),
];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The site's navigation for pages other than the homepage: the same glass bar, adaptive
 * tone, reading progress, and mobile drawer as SiteHeader, with links back to the homepage.
 */
export default function BlogHeader() {
  // Blog pages open on a dark hero, so the server render starts in the dark tone.
  const [tone, setTone] = useState<'light' | 'dark'>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef(0);

  useEffect(() => {
    let frame = 0;
    const darkSurfaces = [...document.querySelectorAll<HTMLElement>('[data-nav-tone="dark"]')];
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      header.current?.style.setProperty(
        '--nav-progress',
        String(scrollable > 0 ? Math.min(1, y / scrollable) : 0),
      );
      const bounds = bar.current?.getBoundingClientRect();
      const probe = bounds ? bounds.top + bounds.height / 2 : 40;
      setTone(
        darkSurfaces.some((surface) => {
          const rect = surface.getBoundingClientRect();
          return rect.top <= probe && rect.bottom >= probe;
        })
          ? 'dark'
          : 'light',
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const element = dialog.current;
    if (!element) return;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    const finish = () => {
      setClosing(false);
      setMenuOpen(false);
    };
    if (prefersReducedMotion()) return finish();
    setClosing(true);
    closeTimer.current = window.setTimeout(finish, DRAWER_EXIT_MS);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width:1100px)');
    const change = () => {
      if (!desktop.matches) return;
      window.clearTimeout(closeTimer.current);
      setClosing(false);
      setMenuOpen(false);
    };
    desktop.addEventListener('change', change);
    return () => {
      desktop.removeEventListener('change', change);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#blog-main">
        Skip to content
      </a>
      <header
        ref={header}
        className="navigation-shell blog-navigation"
        data-tone={tone}
        data-scrolled={scrolled || undefined}
      >
        <div ref={bar} className="navigation-bar">
          <BrandLogo href="/" />
          <nav className="navigation-primary" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.href} className="navigation-link" href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link className="navigation-link" href={blogNavigation.href} aria-current="page">
              {blogNavigation.label}
            </Link>
          </nav>
          <div className="navigation-actions">
            <a className="navigation-login" href={siteConfig.loginUrl}>
              Log in
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <Link className="navigation-cta" href="/#contact">
              Book a call
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="navigation-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="blog-mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className="navigation-burger" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
          <span className="navigation-progress" aria-hidden="true" />
        </div>
      </header>

      <dialog
        ref={dialog}
        id="blog-mobile-menu"
        className="navigation-drawer"
        data-closing={closing || undefined}
        aria-labelledby="blog-mobile-navigation-title"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            closeMenu();
        }}
      >
        <div className="navigation-drawer-top">
          <BrandLogo href="/" />
          <button
            type="button"
            className="navigation-close"
            aria-label="Close navigation menu"
            onClick={closeMenu}
          >
            <span className="navigation-burger navigation-burger-close" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <div className="navigation-drawer-scroll">
          <h2 id="blog-mobile-navigation-title" className="mono">
            EXPLORE NUVATO
          </h2>
          <nav aria-label="Mobile navigation" className="navigation-mobile-links">
            {[...links, { ...blogNavigation }].map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ '--i': index } as CSSProperties}
                aria-current={link.href === blogNavigation.href ? 'page' : undefined}
                onClick={closeMenu}
              >
                <span>
                  <strong>{link.label}</strong>
                  <small>{link.description}</small>
                </span>
                <ArrowUpRight size={20} strokeWidth={1.4} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="navigation-mobile-secondary">
            <Link href="/#faq" onClick={closeMenu}>
              Common questions
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/privacy/" onClick={closeMenu}>
              Privacy & terms
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="navigation-drawer-bottom">
          <Link className="navigation-cta" href="/#contact" onClick={closeMenu}>
            Book a consultation
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <a className="navigation-drawer-login" href={siteConfig.loginUrl}>
            Already working with us?
            <span>
              Log in
              <ArrowUpRight size={14} aria-hidden="true" />
            </span>
          </a>
        </div>
      </dialog>
    </>
  );
}
