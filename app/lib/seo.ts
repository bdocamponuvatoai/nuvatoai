import type {Metadata} from 'next';
import {services,faqs,agents,agentFragment,agentSummary} from './content';
import {siteConfig} from './site-config';

export const siteOrigin=siteConfig.origin;
export const parentOrganizationUrl=siteConfig.parentOrganizationUrl;
export const title='Nuvato AI | Websites, AI Agents, Automation & Enterprise Platforms';
export const description='Websites, AI agents, automation, documentation, and enterprise platforms. Five services, one partner. Scoped first, with a fixed price before work starts.';
const organizationId=siteOrigin+'/#organization';
const websiteId=siteOrigin+'/#website';
const homeId=siteOrigin+'/#webpage';
const serviceId=(id:string)=>siteOrigin+'/#service-'+id;

export function pageMetadata(path:string,pageTitle:string,pageDescription:string):Metadata {
  return {
    title:pageTitle,
    description:pageDescription,
    alternates:{canonical:path},
    openGraph:{title:pageTitle,description:pageDescription,type:'website',siteName:'Nuvato AI',locale:'en_US',url:siteOrigin+path,images:[{url:'/brand/nuvato-social.png',width:1200,height:630,alt:'Nuvato AI — Websites, AI agents, automation, documentation, and enterprise platforms'}]},
    twitter:{card:'summary_large_image',title:pageTitle,description:pageDescription,images:['/brand/nuvato-social.png']},
  };
}

export const structuredData={
  '@context':'https://schema.org',
  '@graph':[
    {
      '@type':'Organization','@id':organizationId,name:siteConfig.business.name,url:siteOrigin+'/',
      address:{'@type':'PostalAddress',addressLocality:siteConfig.business.locality,addressRegion:siteConfig.business.regionCode,addressCountry:siteConfig.business.countryCode},
      areaServed:siteConfig.business.countryCode,
      logo:{'@type':'ImageObject',url:siteOrigin+'/brand/nuvato-logo.png',width:760,height:241},
      description,
      parentOrganization:{'@type':'Organization',name:'Isak Global Ventures',alternateName:'IGV Family',url:parentOrganizationUrl},
      hasOfferCatalog:{'@type':'OfferCatalog','@id':siteOrigin+'/#service-catalog',name:'Nuvato AI services',itemListElement:services.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service','@id':serviceId(s.id),name:s.name,description:s.description,url:siteOrigin+'/#services',provider:{'@id':organizationId}}}))},
    },
    {'@type':'WebSite','@id':websiteId,name:'Nuvato AI',url:siteOrigin+'/',inLanguage:'en',publisher:{'@id':organizationId}},
    {
      '@type':'WebPage','@id':homeId,url:siteOrigin+'/',name:title,description,inLanguage:'en',isPartOf:{'@id':websiteId},about:{'@id':organizationId},
      primaryImageOfPage:{'@type':'ImageObject',url:siteOrigin+'/brand/nuvato-social.png',width:1200,height:630},
      mainEntity:[{'@id':siteOrigin+'/#service-catalog'},{'@id':siteOrigin+'/#agent-catalog'}],hasPart:[{'@id':siteOrigin+'/#faq'}],
    },
    {
      '@type':'ItemList','@id':siteOrigin+'/#agent-catalog',url:siteOrigin+'/#agent-catalog',name:'Nuvato AI agent catalog',description:agentSummary,numberOfItems:agents.length,
      itemListElement:agents.map((agent,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Service','@id':siteOrigin+'/#'+agentFragment(agent.name),url:siteOrigin+'/#'+agentFragment(agent.name),name:agent.name,serviceType:agent.category+' AI agent',provider:{'@id':organizationId},...(!agent.review?{description:agent.description}:{})}})),
    },
    {'@type':'FAQPage','@id':siteOrigin+'/#faq',url:siteOrigin+'/#faq',isPartOf:{'@id':homeId},inLanguage:'en',mainEntity:faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))},
  ],
};
