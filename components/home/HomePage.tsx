import AgentsSection from './AgentsSection';
import { BookingHost } from './Booking';
import CommandCenter from './CommandCenter';
import ContactSection from './ContactSection';
import FaqSection from './FaqSection';
import Hero, { EngagementStrip } from './Hero';
import { HomeStateProvider } from './HomeState';
import ProblemsSection from './ProblemsSection';
import ProcessSection from './ProcessSection';
import ScrollEffects from './ScrollEffects';
import SecuritySection from './SecuritySection';
import ServicesSection from './ServicesSection';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import StatsBand from './StatsBand';
import WhySection from './WhySection';

/**
 * The landing page. Sections render on the server; only the interactive pieces
 * (header, service tabs, agent catalog, consultation form) hydrate on the client.
 */
export default function HomePage() {
  return (
    <HomeStateProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <div className="command-overlap container" data-animate>
          <CommandCenter />
        </div>
        <EngagementStrip />
        <ProblemsSection />
        <ServicesSection />
        <WhySection />
        <AgentsSection />
        <ProcessSection />
        <StatsBand />
        <SecuritySection />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <ScrollEffects />
      <BookingHost />
    </HomeStateProvider>
  );
}
