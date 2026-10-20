'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { services } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { useHomeState } from './HomeState';
import { serviceIcons } from './service-icons';

const serviceSummaries = [
  'Websites built for your next stage.',
  'Defined tasks. Clear permissions.',
  'Connect tools and remove handoffs.',
  'Make the way you work repeatable.',
  'Internal systems built around you.',
];
const destinations = [
  { id: 'agents', label: 'AI agents', description: 'Explore the agent catalog' },
  { id: 'process', label: 'How we work', description: 'From first scope to ongoing care' },
  { id: 'why', label: 'Why Nuvato', description: 'One partner for the whole system' },
  { id: 'security', label: 'Security', description: 'Permissions, reviews, and run logs' },
];
const sectionIds = ['top', 'services', 'why', 'agents', 'process', 'security', 'faq', 'contact'];
const primaryIds = ['services', ...destinations.map((item) => item.id)];
/** Matches the drawer's exit animation in navigation.css. */
const DRAWER_EXIT_MS = 220;

type Tone = 'light' | 'dark';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SiteHeader() {
  const { showService } = useHomeState();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  // The page opens on the dark hero, so the server render starts in the dark tone.
  const [tone, setTone] = useState<Tone>('dark');
  const [hovered, setHovered] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const servicesButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef(0);
  const afterClose = useRef<(() => void) | null>(null);

  // Scroll-driven state: elevation, adaptive tone, active section, and reading progress.
  useEffect(() => {
    let frame = 0;
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => !!element);
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
      let current = '';
      for (const section of sections)
        if (section.getBoundingClientRect().top <= Math.max(130, window.innerHeight * 0.28))
          current = section.id;
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const relayout = () => {
      schedule();
      setLayoutVersion((version) => version + 1);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', relayout);
    document.fonts?.ready.then(relayout);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', relayout);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The sliding highlight follows the hovered item, then settles on the current section.
  // It is positioned imperatively so pointer movement never re-renders the header.
  useEffect(() => {
    const pill = indicator.current,
      container = bar.current;
    if (!pill || !container) return;
    const target =
      hovered ?? (servicesOpen ? 'services' : primaryIds.includes(active) ? active : null);
    const element = target
      ? container.querySelector<HTMLElement>(`[data-nav-item="${target}"]`)
      : null;
    const wasVisible = pill.dataset.visible === 'true';
    if (!element) {
      pill.dataset.visible = 'false';
      return;
    }
    const itemBounds = element.getBoundingClientRect(),
      containerBounds = container.getBoundingClientRect();
    // Appear in place rather than sliding in from the previous position.
    pill.dataset.snap = String(!wasVisible);
    pill.style.setProperty('--indicator-x', `${itemBounds.left - containerBounds.left}px`);
    pill.style.setProperty('--indicator-width', `${itemBounds.width}px`);
    pill.dataset.visible = 'true';
    pill.dataset.current = String(!hovered && !servicesOpen);
  }, [hovered, active, servicesOpen, layoutVersion]);

  useEffect(() => {
    if (!servicesOpen) return;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !header.current?.contains(event.target))
        setServicesOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setServicesOpen(false);
        servicesButton.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [servicesOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const element = dialog.current;
    if (!element) return;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      // dialog.close() restores focus to the opener, so follow-up focus moves must run after it.
      const next = afterClose.current;
      afterClose.current = null;
      next?.();
    };
  }, [mobileOpen]);

  const closeMobile = useCallback((after?: () => void) => {
    window.clearTimeout(closeTimer.current);
    const finish = () => {
      afterClose.current = after ?? null;
      setClosing(false);
      setMobileOpen(false);
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(finish, DRAWER_EXIT_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width:1100px)');
    const change = () => {
      setServicesOpen(false);
      if (desktop.matches) {
        window.clearTimeout(closeTimer.current);
        setClosing(false);
        setMobileOpen(false);
      }
    };
    desktop.addEventListener('change', change);
    return () => desktop.removeEventListener('change', change);
  }, []);

  function navigate(id: string, serviceIndex?: number) {
    if (serviceIndex !== undefined) showService(serviceIndex);
    setServicesOpen(false);
    setHovered(null);
    setActive(id);
    if (!mobileOpen) return;
    // Move focus to the destination heading once the drawer has closed.
    closeMobile(() => {
      const target = document.getElementById(id)?.querySelector<HTMLElement>('h1,h2,h3');
      if (!target) return;
      const previous = target.getAttribute('tabindex');
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener(
        'blur',
        () => {
          if (previous === null) target.removeAttribute('tabindex');
          else target.setAttribute('tabindex', previous);
        },
        { once: true },
      );
    });
  }

  const track = (id: string) => ({
    'data-nav-item': id,
    onPointerEnter: () => setHovered(id),
    onFocus: () => setHovered(id),
    onBlur: () => setHovered(null),
  });

  return (
    <>
      <header
        ref={header}
        className="navigation-shell"
        data-tone={tone}
        data-scrolled={scrolled || undefined}
        data-menu-open={servicesOpen || undefined}
      >
        <div ref={bar} className="navigation-bar">
          <BrandLogo href="#top" onClick={() => navigate('top')} />
          <nav
            className="navigation-primary"
            aria-label="Primary navigation"
            onPointerLeave={() => setHovered(null)}
          >
            <span
              ref={indicator}
              className="navigation-indicator"
              aria-hidden="true"
              data-visible="false"
            />
            <div className="navigation-services">
              <button
                type="button"
                {...track('services')}
                ref={servicesButton}
                className="navigation-link"
                aria-expanded={servicesOpen}
                aria-controls="services-navigation"
                aria-current={active === 'services' ? 'location' : undefined}
                onClick={() => setServicesOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setServicesOpen(true);
                    requestAnimationFrame(() =>
                      document.querySelector<HTMLAnchorElement>('#services-navigation a')?.focus(),
                    );
                  }
                }}
              >
                Services
                <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
              </button>
              <div
                id="services-navigation"
                className="navigation-dropdown"
                data-open={servicesOpen || undefined}
                inert={!servicesOpen}
              >
                <div className="navigation-dropdown-heading">
                  <span className="mono">FIVE WAYS TO MOVE FORWARD</span>
                  <a href="#services" onClick={() => navigate('services')}>
                    All services
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
                <div className="navigation-service-grid">
                  {services.map((service, index) => {
                    const Icon = serviceIcons[index];
                    return (
                      <a
                        key={service.id}
                        href="#services"
                        onClick={() => navigate('services', index)}
                        className="navigation-service-card"
                        style={{ '--i': index } as CSSProperties}
                      >
                        <span className="navigation-service-icon">
                          <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                        </span>
                        <span>
                          <strong>{service.name}</strong>
                          <small>{serviceSummaries[index]}</small>
                        </span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
                <div className="navigation-dropdown-footer">
                  <p>Start with the part that needs attention.</p>
                  <a href="#contact" onClick={() => navigate('contact')}>
                    Let’s talk
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
            {destinations.map((item) => (
              <a
                key={item.id}
                {...track(item.id)}
                className="navigation-link"
                href={`#${item.id}`}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="navigation-actions">
            <a className="navigation-login" href={siteConfig.loginUrl}>
              Log in
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a className="navigation-cta" href="#contact" onClick={() => navigate('contact')}>
              Book a call
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="navigation-menu-button"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                setServicesOpen(false);
                setMobileOpen(true);
              }}
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
        id="mobile-menu"
        className="navigation-drawer"
        data-closing={closing || undefined}
        aria-labelledby="mobile-navigation-title"
        onCancel={(event) => {
          event.preventDefault();
          closeMobile();
        }}
        onClose={() => setMobileOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              closeMobile();
          }
        }}
      >
        <div className="navigation-drawer-top">
          <BrandLogo href="#top" onClick={() => navigate('top')} />
          <button
            type="button"
            className="navigation-close"
            aria-label="Close navigation menu"
            onClick={() => closeMobile()}
          >
            <span className="navigation-burger navigation-burger-close" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
        <div className="navigation-drawer-scroll">
          <h2 id="mobile-navigation-title" className="mono">
            EXPLORE NUVATO
          </h2>
          <nav aria-label="Mobile navigation" className="navigation-mobile-links">
            <details className="navigation-mobile-services" style={{ '--i': 0 } as CSSProperties}>
              <summary>
                <span>
                  <strong>Services</strong>
                  <small>Five services. One partner.</small>
                </span>
                <ChevronDown size={19} aria-hidden="true" />
              </summary>
              <div>
                {services.map((service, index) => {
                  const Icon = serviceIcons[index];
                  return (
                    <a
                      key={service.id}
                      href="#services"
                      onClick={() => navigate('services', index)}
                    >
                      <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                      <span>{service.name}</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </details>
            {destinations.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{ '--i': index + 1 } as CSSProperties}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={() => navigate(item.id)}
              >
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowUpRight size={20} strokeWidth={1.4} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <div className="navigation-mobile-secondary">
            <a href="#faq" onClick={() => navigate('faq')}>
              Common questions
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <a href="/privacy/">
              Privacy & terms
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="navigation-drawer-bottom">
          <a className="navigation-cta" href="#contact" onClick={() => navigate('contact')}>
            Book a consultation
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
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
