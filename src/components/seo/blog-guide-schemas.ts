const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

type GuideRankedItem = {
  name: string;
  url?: string; // canonical Homara URL when the product has a /producto/<slug> page
};

type GuideFaq = {
  question: string;
  answer: string;
};

export interface BlogGuideSchemaInput {
  path: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  category?: string;
  keywords?: string[];
  rankedItems?: GuideRankedItem[];
  faqs?: GuideFaq[];
  /** Plain-text condensed body for AI passage indexing. */
  articleBody?: string;
}

/**
 * Build the four JSON-LD schemas every hand-built blog guide should emit:
 * Article, BreadcrumbList, FAQPage (when faqs ≥ 2), ItemList (when rankedItems).
 */
export function buildBlogGuideSchemas(input: BlogGuideSchemaInput) {
  const url = `${SITE_URL}${input.path}`;
  const wordCount = input.articleBody
    ? input.articleBody.split(/\s+/).filter(Boolean).length
    : undefined;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: "es",
    articleSection: input.category,
    keywords: input.keywords?.length ? input.keywords.join(", ") : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt || input.publishedAt,
    author: {
      "@type": "Organization",
      name: "Equipo editorial Homara",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Homara",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/homara-logo.svg` },
    },
    mainEntityOfPage: url,
    image: input.image
      ? [{ "@type": "ImageObject", url: input.image, width: 1200, height: 630 }]
      : undefined,
    articleBody: input.articleBody,
    wordCount,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: input.title, item: url },
    ],
  };

  const faqPage =
    input.faqs && input.faqs.length >= 2
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: input.faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const itemList =
    input.rankedItems && input.rankedItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: input.title,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: input.rankedItems.length,
          itemListElement: input.rankedItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        }
      : null;

  return { article, breadcrumb, faqPage, itemList };
}
