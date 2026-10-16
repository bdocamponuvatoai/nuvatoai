import type {Metadata,Viewport} from 'next';
import {headers} from 'next/headers';
import {siteOrigin,title,description,structuredData} from './lib/seo';
import {siteConfig} from './lib/site-config';
import './globals.css';
import './agents.css';
import './tools.css';
import './navigation.css';
import './directory.css';
import './polish.css';
export const metadata:Metadata={metadataBase:new URL(siteOrigin),title,description,alternates:{canonical:'/'},robots:{index:siteConfig.indexable,follow:siteConfig.indexable},openGraph:{title,description,type:'website',siteName:'Nuvato AI',locale:'en_US',url:siteOrigin+'/',images:[{url:'/brand/nuvato-social.png',width:1200,height:630,alt:'Nuvato AI — We build the systems your business runs on.'}]},twitter:{card:'summary_large_image',title,description,images:['/brand/nuvato-social.png']},icons:{icon:[{url:'/favicon.ico',sizes:'48x48'},{url:'/brand/favicon-16.png',sizes:'16x16',type:'image/png'},{url:'/brand/favicon-32.png',sizes:'32x32',type:'image/png'}],apple:[{url:'/brand/icon-180.png',sizes:'180x180'}]},manifest:'/manifest.webmanifest'};
export const viewport:Viewport={themeColor:'#0A1230',width:'device-width',initialScale:1,viewportFit:'cover'};
export default async function RootLayout({children}:{children:React.ReactNode}){const requestHeaders=await headers();const nonce=requestHeaders.get('x-nonce')||undefined;const isHome=requestHeaders.get('x-site-path')==='/';return <html lang="en"><head><link rel="preload" href="/fonts/sora.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>{isHome&&<script type="application/ld+json" nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,'\\u003c')}}/>}</head><body>{children}</body></html>;}
