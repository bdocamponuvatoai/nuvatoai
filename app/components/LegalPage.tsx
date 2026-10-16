import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { legalDocuments, legalMeta, type LegalDocument } from '../lib/legal-content';
import BrandLogo from './BrandLogo';

export function LegalHeader(){
 return <><a className="skip-link" href="#legal-main">Skip to content</a><header className="navigation-shell legal-header" data-tone="light"><div className="navigation-bar"><BrandLogo href="/"/><nav className="navigation-legal" aria-label="Legal navigation"><a href="/terms/">Privacy & terms</a>
  {/* A full document navigation is intended here; this header also renders outside the Next router in scripts/verify-site.mjs. */}
  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
  <a href="/" className="navigation-legal-back"><ArrowLeft size={14} aria-hidden="true"/>Back to website</a>
 </nav></div></header></>;
}
export function LegalFooter(){return <footer className="legal-footer section-shell"><p>© {new Date().getFullYear()} Nuvato AI · Chicago, Illinois, USA. All rights reserved.</p><nav aria-label="Legal pages">{legalDocuments.map(d=><a key={d.slug} href={`/${d.slug}/`}>{d.title}</a>)}</nav></footer>;}
/** Renders legal copy, turning [label](href) and email addresses into links. */
function LegalText({text}:{text:string}){
 return <>{text.split(/(\[[^\]]+\]\([^)]+\)|[\w.+-]+@[\w-]+\.[\w.]+\w)/).map((part,i)=>{
  if(i%2===0)return part;
  const link=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if(link)return <a key={i} href={link[2]} {...(link[2].startsWith('http')?{rel:'noopener noreferrer'}:{})}>{link[1]}</a>;
  return <a key={i} href={`mailto:${part}`}>{part}</a>;
 })}</>;
}
export default function LegalPage({document}:{document:LegalDocument}){
 return <><LegalHeader/><main id="legal-main" className="section-shell legal-main"><div className="legal-breadcrumb"><a href="/terms/">Privacy & terms</a><span>/</span>{document.title}</div><div className="legal-title"><p className="eyebrow"><span/>{document.eyebrow}</p><h1>{document.title}</h1><p>{document.description}</p><span className="legal-version">Effective {document.effective??legalMeta.effective} · Last updated {document.updated??legalMeta.updated} · Version {legalMeta.version}</span></div><div className="legal-summary">{document.summary.map((s,i)=><article key={s.title}><span>0{i+1}</span><h2>{s.title}</h2><p><LegalText text={s.text}/></p></article>)}</div><div className="legal-layout"><aside className="legal-toc"><h2>On this page</h2><nav aria-label="Table of contents">{document.sections.map(s=><a key={s.id} href={`#${s.id}`}>{s.title.replace(/^\d+\. /,'')}</a>)}</nav><div className="legal-toc-note"><ShieldCheck size={18}/><p>Privacy and consent should be clear before you share information.</p></div></aside><article className="legal-copy">{document.sections.map(s=><section id={s.id} key={s.id}><h2>{s.title}</h2>{s.highlight&&<p className="legal-highlight"><LegalText text={s.highlight}/></p>}{s.paragraphs?.map(p=><p key={p}><LegalText text={p}/></p>)}{s.bullets&&<ul>{s.bullets.map(b=><li key={b}><LegalText text={b}/></li>)}</ul>}</section>)}<div className="legal-related"><h2>Related pages</h2>{legalDocuments.filter(d=>d.slug!==document.slug).map(d=><a key={d.slug} href={`/${d.slug}/`}>{d.title}<ArrowUpRight size={17}/></a>)}</div></article></div></main><LegalFooter/></>;
}
