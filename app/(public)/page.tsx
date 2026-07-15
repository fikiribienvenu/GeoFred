import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import AgentNetworkSection from '@/components/home/AgentNetworkSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';
import CTASection from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <FeaturedProperties />
      <AgentNetworkSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
    </>
  );
}
