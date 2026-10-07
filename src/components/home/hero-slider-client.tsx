'use client';

import { useEffect, useRef, useState } from 'react';
import { getImageProps } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Container } from '@/components/layout/container';
import type { HeroSlide, HeroSocialLinks } from './hero-slider';

interface SwiperControls {
  slidePrev: () => void;
  slideNext: () => void;
}

const TYPE_LABELS: Record<HeroSlide['type'], string | null> = {
  offer: 'Oferta',
  shipping: 'Envíos',
  payment: 'Contraentrega',
  custom: null,
};

interface HeroSliderClientProps {
  slides: HeroSlide[];
  socialLinks: HeroSocialLinks | null;
}

export function HeroSliderClient({ slides, socialLinks }: HeroSliderClientProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const swiperRef = useRef<SwiperControls | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  return (
    <section
      className="hero-swiper relative w-full"
      aria-roledescription="carrusel"
      aria-label="Banners de inicio"
    >
      <Swiper
        modules={[Pagination, Autoplay, A11y]}
        slidesPerView={1}
        loop={slides.length > 1}
        onSwiper={(instance) => {
          swiperRef.current = instance;
        }}
        pagination={{ clickable: true }}
        a11y={{ paginationBulletMessage: 'Ir a la diapositiva {{index}}' }}
        autoplay={
          reducedMotion
            ? false
            : { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }
        }
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.title}-${index}`}>
            <SlideView slide={slide} index={index} socialLinks={socialLinks} />
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Banner anterior"
            className="absolute left-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-brand-dark shadow-lg ring-1 ring-black/5 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-4 md:top-4 md:h-12 md:w-12"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Banner siguiente"
            className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-brand-dark shadow-lg ring-1 ring-black/5 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-4 md:top-4 md:h-12 md:w-12"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

function SlideView({
  slide,
  index,
  socialLinks,
}: {
  slide: HeroSlide;
  index: number;
  socialLinks: HeroSocialLinks | null;
}) {
  const priority = index === 0;
  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';
  const desktop = getImageProps({
    src: slide.desktopImage,
    alt: slide.alt,
    width: 1920,
    height: 505,
    sizes: '(min-width: 1024px) min(100vw, 1280px), 0px',
    priority,
    loading,
    fetchPriority,
  }).props;
  const mobile = getImageProps({
    src: slide.mobileImage,
    alt: slide.alt,
    width: 800,
    height: 800,
    sizes: '(min-width: 1024px) 0px, 100vw',
    priority,
    loading,
    fetchPriority,
  }).props;

  const badge = TYPE_LABELS[slide.type];
  const showSocials =
    slide.showSocialLinks &&
    Boolean(socialLinks && (socialLinks.instagram || socialLinks.facebook || socialLinks.tiktok));

  return (
    <div className="relative aspect-[8/7] w-full overflow-hidden bg-brand-dark md:aspect-[1520/345]">
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        <img {...mobile} className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-end md:items-center">
        <Container>
          <div className="max-w-xl pb-8 md:pb-6">
            {badge && (
              <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-dark">
                {badge}
              </span>
            )}
            <h2 className="mt-3 animate-[fadeInUp_0.7s_ease-out_both] text-2xl font-bold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] md:text-4xl">
              {slide.title}
            </h2>
            {slide.description && (
              <p className="mt-3 animate-[fadeInUp_0.7s_ease-out_120ms_both] text-base text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.65)] md:text-lg">
                {slide.description}
              </p>
            )}
            {slide.buttonLabel && slide.buttonLink && (
              <div className="mt-4 animate-[fadeInUp_0.7s_ease-out_240ms_both]">
                <a
                  href={slide.buttonLink}
                  className="inline-block rounded-lg bg-brand-dark px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {slide.buttonLabel}
                </a>
              </div>
            )}
            <div className="mt-4 flex animate-[fadeInUp_0.7s_ease-out_360ms_both] flex-wrap items-center gap-x-6 gap-y-3">
              {slide.note && (
                <p className="text-xs font-medium text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
                  {slide.note}
                </p>
              )}
              {showSocials && socialLinks && (
                <div className="flex gap-3">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M14 8h3V5h-3a4 4 0 0 0-4 4v2H7v3h3v7h3v-7h3l1-3h-4V9a1 1 0 0 1 1-1Z" fill="currentColor" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M16.6 5.82A4.28 4.28 0 0 1 15.1 3h-3.1v13.05a2.56 2.56 0 1 1-2.56-2.56c.25 0 .5.04.72.11V10.4a5.7 5.7 0 0 0-.72-.05 5.66 5.66 0 1 0 5.66 5.66V9.66a7.32 7.32 0 0 0 4.28 1.37V8.01a4.25 4.25 0 0 1-3.18-2.19Z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}