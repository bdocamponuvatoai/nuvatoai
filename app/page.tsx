import HomePage from '@/components/home/HomePage';
import { structuredData } from '@/lib/seo';

/** JSON-LD is data, not script, so it needs no CSP nonce. `<` is escaped to keep it inert. */
const jsonLd = JSON.stringify(structuredData).replace(/</g, '\\u003c');

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <HomePage />
    </>
  );
}
