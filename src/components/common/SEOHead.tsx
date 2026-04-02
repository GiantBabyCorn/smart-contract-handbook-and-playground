import { SITE_URL } from '@/utils/constants';

interface SEOHeadProps {
  title: string;
  description: string;
  slug?: string;
}

/**
 * React 19 native metadata component.
 * Renders <title>, <meta> and Open Graph tags that React 19 hoists to <head>.
 */
export default function SEOHead({ title, description, slug }: SEOHeadProps) {
  const fullTitle = `${title} — ERC Explorer`;
  const url = slug ? `${SITE_URL}/${slug}` : SITE_URL;
  const image = slug ? `/og/${slug}.png` : '/og-image.png';

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ERC Explorer" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </>
  );
}
