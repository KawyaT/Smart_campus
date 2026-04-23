/**
 * Campus / hero images from `src/assets/` (jpg, jpeg, png, webp).
 * Brand files (logo, favicon, etc.) are excluded from backgrounds & slideshows.
 */
import fallbackHero from '../../assets/user-dashboard-hero.jpg';

const globModules = import.meta.glob('../../assets/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

/** File base name is brand / UI — not a full-bleed background. */
function isExcludedBackgroundFile(fileName) {
  if (!fileName) return true;
  const n = fileName.toLowerCase();
  if (n === 'logo.png' || n === 'logo.jpg' || n === 'logo.jpeg' || n === 'logo.webp') return true;
  if (/^logo[._-]/.test(n) || /[._-]logo[._-]/.test(n)) return true;
  if (/(^|[-_])favicon($|[-_.])|icon-?set|brand-?mark|wordmark|app-?icon/.test(n)) return true;
  return false;
}

function fileNameFromKey(globPath) {
  const norm = String(globPath).replace(/\\/g, '/');
  const seg = norm.split('/').filter(Boolean);
  return seg[seg.length - 1] || '';
}

const fromGlob = Object.entries(globModules)
  .filter(([pathKey]) => !isExcludedBackgroundFile(fileNameFromKey(pathKey)))
  .map(([, url]) => url)
  .filter((u) => typeof u === 'string' && u.length > 0);

const unique = [...new Set(fromGlob)];

/**
 * All non-logo marketing backgrounds. At least one image (campus hero fallback).
 */
export const MARKETING_BACKGROUNDS = unique.length > 0 ? unique : [fallbackHero];

/** @deprecated use MARKETING_BACKGROUNDS */
export const PUBLIC_MARKETING_IMAGES = MARKETING_BACKGROUNDS;

/**
 * Home hero slideshow — every suitable asset, never the logo.
 */
export function getSlideshowImages() {
  return [...MARKETING_BACKGROUNDS];
}

export function getHeroImages() {
  return getSlideshowImages();
}

const PAGE_OFFSET = {
  about: 0,
  aboutSide: 1,
  services: 2,
  contact: 3,
  homeSplitA: 4,
  homeSplitB: 5,
};

/**
 * Stable per-page background from the pool (different slugs → different images when enough files exist).
 */
export function getPageHeroImage(slug) {
  const list = MARKETING_BACKGROUNDS;
  const o = PAGE_OFFSET[slug] ?? 0;
  return list[o % list.length];
}
