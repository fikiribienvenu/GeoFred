import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AgentNetworkSection from '@/components/home/AgentNetworkSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';
import CTASection from '@/components/home/CTASection';
import { getFeaturedProperties, getFeaturedAgents } from '@/lib/data';

// Revalidate every 60 seconds — data stays fresh without blocking every request
export const revalidate = 60;

export default async function HomePage() {
  // Fetch both in parallel on the server — no client round-trip, no cold start wait
  const [properties, { agents, stats }] = await Promise.all([
    getFeaturedProperties(),
    getFeaturedAgents(),
  ]);

  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <FeaturedProperties initialProperties={properties} />
      <AgentNetworkSection initialAgents={agents} initialStats={stats} />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </>
  );
}
