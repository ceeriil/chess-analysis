// ============================================================
// ⬢ HOME PAGE
// ============================================================
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { NavBar }                from '@/components/home/NavBar';
import { HeroSection }           from '@/components/home/HeroSection';
import { FeatureStrip }          from '@/components/home/FeatureStrip';
import { SampleOpponentsSection } from '@/components/home/SampleOpponentsSection';
import { NemesisPanel }          from '@/components/home/NemesisPanel';
import { HowItWorks }            from '@/components/home/HowItWorks';
import { CtaBanner }             from '@/components/home/CtaBanner';
import { Footer }                from '@/components/home/Footer';


type IndexPageProps = {
  params: Promise<{ locale: string }>;
};


export async function generateMetadata(
  props: IndexPageProps,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  return {
    title:       t('meta_title'),
    description: t('meta_description'),
  };
}


export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
   
    <div className="pm-page min-h-screen bg-[#F8F3E8]">

      <NavBar locale={locale} />

      <HeroSection locale={locale} />

      <FeatureStrip />

      <SampleOpponentsSection />

      <NemesisPanel />

      <HowItWorks />

      <CtaBanner locale={locale} />

      <Footer />
    </div>
  );
}