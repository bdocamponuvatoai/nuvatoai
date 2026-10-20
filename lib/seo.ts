import type { Metadata } from 'next';
import { assetUrl, images } from './assets';
import { agentFragment, agentSummary, agents, faqs, services } from './content';
import { siteEnv } from './env';
import { siteConfig } from './site-config';

export const siteOrigin = siteEnv.origin;
export const title = 'Nuvato AI | Websites, AI Agents, Automation & Enterprise Platforms';
export const description =
  'Websites, AI agents, automation, documentation, and enterprise platforms. Five services, one partner. Scoped first, with a fixed price before work starts.';

export const socialImage = {
  url: assetUrl(images.socialCard),
  width: 1200,
  height: 630,
  alt: 'Nuvato AI — Websites, AI agents, automation, documentation, and enterprise platforms',
};

/** Pages listed in the sitemap, with trailing slashes to match `trailingSlash: true`. */
export const sitePaths = ['/', '/privacy/', '/terms/', '/sms-terms/'] as const;

export function pageMetadata(path: string, pageTitle: string, pageDescription: string): Metadata {
  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: path },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      siteName: 'Nuvato AI',
      locale: 'en_US',
      url: siteOrigin + path,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [socialImage.url],
    },
  };
}

const organizationId = `${siteOrigin}/#organization`;
const websiteId = `${siteOrigin}/#website`;
const homeId = `${siteOrigin}/#webpage`;
const serviceCatalogId = `${siteOrigin}/#service-catalog`;
const agentCatalogId = `${siteOrigin}/#agent-catalog`;
const faqId = `${siteOrigin}/#faq`;

/** Homepage JSON-LD. Every value mirrors copy that is visible on the page. */
export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: siteConfig.business.name,
      url: `${siteOrigin}/`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: siteConfig.business.locality,
        addressRegion: siteConfig.business.regionCode,
        addressCountry: siteConfig.business.countryCode,
      },
      areaServed: siteConfig.business.countryCode,
      logo: {
        '@type': 'ImageObject',
        url: assetUrl(images.logo),
        width: 760,
        height: 241,
      },
      description,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Isak Global Ventures',
        alternateName: 'IGV Family',
        url: siteConfig.parentOrganizationUrl,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        '@id': serviceCatalogId,
        name: 'Nuvato AI services',
        itemListElement: services.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            '@id': `${siteOrigin}/#service-${service.id}`,
            name: service.name,
            description: service.description,
            url: `${siteOrigin}/#services`,
            provider: { '@id': organizationId },
          },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: 'Nuvato AI',
      url: `${siteOrigin}/`,
      inLanguage: 'en',
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': homeId,
      url: `${siteOrigin}/`,
      name: title,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: socialImage.url,
        width: socialImage.width,
        height: socialImage.height,
      },
      mainEntity: [{ '@id': serviceCatalogId }, { '@id': agentCatalogId }],
      hasPart: [{ '@id': faqId }],
    },
    {
      '@type': 'ItemList',
      '@id': agentCatalogId,
      url: agentCatalogId,
      name: 'Nuvato AI agent catalog',
      description: agentSummary,
      numberOfItems: agents.length,
      itemListElement: agents.map((agent, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          '@id': `${siteOrigin}/#${agentFragment(agent.name)}`,
          url: `${siteOrigin}/#${agentFragment(agent.name)}`,
          name: agent.name,
          serviceType: `${agent.category} AI agent`,
          provider: { '@id': organizationId },
          // Descriptions still under client review stay out of structured data.
          ...(agent.review ? {} : { description: agent.description }),
        },
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': faqId,
      url: faqId,
      isPartOf: { '@id': homeId },
      inLanguage: 'en',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
};
