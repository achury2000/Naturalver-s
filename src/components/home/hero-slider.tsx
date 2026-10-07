import { existsSync } from 'node:fs';
import path from 'node:path';
import { getImageUrl } from '@/lib/media';
import { queryHomeBanners } from '@/lib/payload';
import { HeroSliderClient } from './hero-slider-client';

export type HeroSlideType = 'offer' | 'shipping' | 'payment' | 'custom';

export interface HeroSlide {
  type: HeroSlideType;
  title: string;
  description: string | null;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  buttonLabel: string | null;
  buttonLink: string | null;
  note: string | null;
  showSocialLinks: boolean;
}

export interface HeroSocialLinks {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
}

const BANNER_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;

function localBannerUrl(position: number): string | null {
  const name = `banner${position + 1}`;
  const base = path.join(process.cwd(), 'public', name);
  for (const ext of BANNER_EXTENSIONS) {
    if (existsSync(`${base}.${ext}`)) return `/${name}.${ext}`;
  }
  return null;
}

export async function HeroSlider() {
  const banners = await queryHomeBanners();

  const socialLinks: HeroSocialLinks | null = banners?.socialLinks
    ? {
        instagram: banners.socialLinks.instagram ?? null,
        facebook: banners.socialLinks.facebook ?? null,
        tiktok: banners.socialLinks.tiktok ?? null,
      }
    : null;

  const heroSlides: HeroSlide[] = (banners?.slides ?? [])
    .filter((slide) => slide.active !== false)
    .map((slide, index) => {
      const desktopMedia = typeof slide.desktopImage === 'string' ? null : slide.desktopImage;
      const mobileMedia = typeof slide.mobileImage === 'string' ? null : slide.mobileImage;
      const local = localBannerUrl(index);
      const alt =
        (desktopMedia && desktopMedia.alt) || (mobileMedia && mobileMedia.alt) || slide.title;
      return {
        type: slide.type ?? 'custom',
        title: slide.title,
        description: slide.description ?? null,
        desktopImage: local ?? getImageUrl(desktopMedia),
        mobileImage: local ?? getImageUrl(mobileMedia),
        alt,
        buttonLabel: slide.buttonLabel ?? null,
        buttonLink: slide.buttonLink ?? null,
        note: slide.note ?? null,
        showSocialLinks: Boolean(slide.showSocialLinks),
      };
    })
    .filter((slide) => slide.desktopImage && slide.mobileImage);

  if (heroSlides.length === 0) return null;

  return <HeroSliderClient slides={heroSlides} socialLinks={socialLinks} />;
}