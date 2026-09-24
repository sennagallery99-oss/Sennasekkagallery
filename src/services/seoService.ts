import { useEffect } from 'react';
import { SewaProduct, getTotalProductStock } from '../types/sewa';
import { formatDriveImageUrl } from './googleDriveService';

export interface MetaTagOptions {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: string;
  price?: number;
  currency?: string;
  category?: string;
  sku?: string;
  inStock?: boolean;
}

const DEFAULT_TITLE = 'Senna MUA Gallery & Sekka Design Decoration | Vendor Pernikahan Mewah & Elegan';
const DEFAULT_DESCRIPTION = 'Website resmi wedding studio Senna MUA Gallery & Sekka Design Decoration, lengkap dengan platform rental busana premium Senna Gallery Sewa (kebaya, jas, gaun), galeri portofolio, dan booking WhatsApp otomatis.';

/**
 * Utility to set or update a <meta> element in the document <head>.
 */
const setMetaTag = (attributeName: 'name' | 'property', attributeValue: string, content: string) => {
  if (typeof document === 'undefined') return;
  
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Utility to set or update the <link rel="canonical"> in the document <head>.
 */
export const setCanonicalUrl = (url: string) => {
  if (typeof document === 'undefined') return;

  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

/**
 * Utility to insert or update a JSON-LD structured data script.
 */
export const setStructuredData = (scriptId: string, data: object) => {
  if (typeof document === 'undefined') return;

  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/**
 * Removes a JSON-LD structured data script by ID.
 */
export const removeStructuredData = (scriptId: string) => {
  if (typeof document === 'undefined') return;
  const script = document.getElementById(scriptId);
  if (script) {
    script.remove();
  }
};

/**
 * Dynamically updates page title, description, canonical link, OpenGraph, Twitter card,
 * and Schema.org Product structured data when navigating into a specific product detail page.
 */
export const updateProductMetaTags = (product: SewaProduct) => {
  if (typeof window === 'undefined' || !product) return;

  const origin = window.location.origin;
  const canonicalUrl = `${origin}/sewa/produk/${encodeURIComponent(product.id)}`;
  const title = `${product.name} - Sewa Busana ${product.categoryLabel || 'Premium'} | Senna Gallery Bandar Lampung`;
  
  // Concise, compelling SEO description (120-160 chars)
  const priceText = product.priceFormatted || `Rp ${Number(product.price || 0).toLocaleString('id-ID')} / 3 hari`;
  const rawDesc = product.description 
    ? product.description.replace(/[\r\n]+/g, ' ').slice(0, 110)
    : `Sewa ${product.name} kualitas premium di Senna Gallery Bandar Lampung.`;
  const description = `${rawDesc} Harga sewa ${priceText}. Free fitting studio & dry clean steril.`.slice(0, 160);

  const mainImageUrl = product.imageUrl ? formatDriveImageUrl(product.imageUrl) : `${origin}/Senna.png`;
  const galleryImages = [
    mainImageUrl,
    ...(product.additionalImages || []).map((img) => formatDriveImageUrl(img))
  ].filter(Boolean);

  // 1. Update Document Title
  document.title = title;

  // 2. Standard Meta Description
  setMetaTag('name', 'description', description);

  // 3. Dynamic Canonical Link
  setCanonicalUrl(canonicalUrl);

  // 4. OpenGraph Tags (Facebook, WhatsApp, LinkedIn, Discord)
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', mainImageUrl);
  setMetaTag('property', 'og:site_name', 'Senna Gallery Sewa Busana');
  if (product.price) {
    setMetaTag('property', 'product:price:amount', String(product.price));
    setMetaTag('property', 'product:price:currency', 'IDR');
  }

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', mainImageUrl);

  // 6. Schema.org Product Structured Data (JSON-LD)
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description || description,
    'image': galleryImages,
    'sku': product.id,
    'category': product.categoryLabel || 'Sewa Busana',
    'brand': {
      '@type': 'Brand',
      'name': 'Senna Gallery'
    },
    'offers': {
      '@type': 'Offer',
      'url': canonicalUrl,
      'priceCurrency': 'IDR',
      'price': product.price || 0,
      'priceValidUntil': '2028-12-31',
      'itemCondition': 'https://schema.org/UsedCondition',
      'availability': getTotalProductStock(product) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Senna MUA Gallery & Sekka Design Decoration',
        'telephone': '+6281369527774',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Bandar Lampung',
          'addressRegion': 'Lampung',
          'addressCountry': 'ID'
        }
      }
    }
  };

  setStructuredData('sewa-product-jsonld', schemaData);
};

/**
 * Resets meta tags and canonical link back to the application defaults.
 */
export const resetMetaTags = () => {
  if (typeof document === 'undefined') return;

  document.title = DEFAULT_TITLE;
  setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
  
  if (typeof window !== 'undefined') {
    setCanonicalUrl(window.location.origin + window.location.pathname);
    setMetaTag('property', 'og:url', window.location.origin + window.location.pathname);
  }

  setMetaTag('property', 'og:title', DEFAULT_TITLE);
  setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
  setMetaTag('property', 'og:type', 'website');
  setMetaTag('property', 'og:image', `${typeof window !== 'undefined' ? window.location.origin : ''}/Senna.png`);

  setMetaTag('name', 'twitter:title', DEFAULT_TITLE);
  setMetaTag('name', 'twitter:description', DEFAULT_DESCRIPTION);

  removeStructuredData('sewa-product-jsonld');
};

/**
 * React Hook that automatically applies dynamic SEO meta tags when mounting a product detail page
 * and safely restores default meta tags when unmounting.
 */
export const useProductSEO = (product?: SewaProduct | null) => {
  useEffect(() => {
    if (product) {
      updateProductMetaTags(product);
    }
    return () => {
      resetMetaTags();
    };
  }, [product]);
};
