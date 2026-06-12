/** @jest-environment node */
import { parseQuickFillHtml } from "./quickFillParser";

describe("parseQuickFillHtml", () => {
  it("returns all-null for unrelated HTML", () => {
    const result = parseQuickFillHtml("<!doctype html><html><head><title>x</title></head><body></body></html>");
    expect(result).toEqual({
      name: null,
      image: null,
      description: null,
      price: null,
      brandGuess: null,
    });
  });

  it("extracts OG meta tags", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Outsunny Conjunto Comedor 5 Piezas | Amazon.es">
        <meta property="og:image" content="https://m.media-amazon.com/images/I/abc.jpg">
        <meta property="og:description" content="Conjunto de comedor de aluminio y textileno con 4 sillas apilables.">
      </head><body></body></html>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.name).toBe("Outsunny Conjunto Comedor 5 Piezas");
    expect(result.image).toBe("https://m.media-amazon.com/images/I/abc.jpg");
    expect(result.description).toBe(
      "Conjunto de comedor de aluminio y textileno con 4 sillas apilables.",
    );
    expect(result.brandGuess).toBe("Outsunny");
  });

  it("decodes HTML entities in OG content", () => {
    const html = `<meta property="og:title" content="Caf&eacute;tera N&uacute;m. 1 &amp; Co.">`;
    // entities not in our basic map → only &amp; decodes. We don't aim for full entity coverage,
    // just the common ones. Verify the &amp; decode works.
    const result = parseQuickFillHtml(`<meta property="og:title" content="Mesa &amp; Sillas">`);
    expect(result.name).toBe("Mesa & Sillas");
  });

  it("falls back to twitter:image when og:image missing", () => {
    const html = `
      <meta property="og:title" content="Producto X">
      <meta name="twitter:image" content="https://example.com/img.jpg">
    `;
    const result = parseQuickFillHtml(html);
    expect(result.image).toBe("https://example.com/img.jpg");
  });

  it("extracts JSON-LD Product and prefers it over OG for price/brand", () => {
    const html = `
      <meta property="og:title" content="Junk Title">
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Mesa Outsunny 140cm",
          "description": "Mesa de jardín en aluminio.",
          "image": "https://example.com/mesa.jpg",
          "brand": { "@type": "Brand", "name": "Outsunny" },
          "offers": { "@type": "Offer", "price": "219.99", "priceCurrency": "EUR" }
        }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.name).toBe("Mesa Outsunny 140cm");
    expect(result.price).toBe(219.99);
    expect(result.brandGuess).toBe("Outsunny");
    expect(result.image).toBe("https://example.com/mesa.jpg");
  });

  it("coerces Spanish-formatted price strings", () => {
    const html = `
      <script type="application/ld+json">
        { "@type": "Product", "offers": { "price": "1.099,50" } }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.price).toBe(1099.5);
  });

  it("picks the cheapest price across an offers array", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "Product",
          "offers": [
            { "@type": "Offer", "price": 299.99 },
            { "@type": "Offer", "price": 249.99 },
            { "@type": "Offer", "price": 279.99 }
          ]
        }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.price).toBe(249.99);
  });

  it("reads price from nested priceSpecification", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "Product",
          "offers": {
            "@type": "AggregateOffer",
            "priceSpecification": { "price": "189.00" }
          }
        }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.price).toBe(189);
  });

  it("uses lowPrice when price is absent", () => {
    const html = `
      <script type="application/ld+json">
        { "@type": "Product", "offers": { "lowPrice": "99.50", "highPrice": "150" } }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.price).toBe(99.5);
  });

  it("walks @graph and nested arrays to find Product", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", "name": "page" },
            { "@type": ["Product", "Thing"], "name": "Silla", "offers": { "price": 49.99 } }
          ]
        }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.name).toBe("Silla");
    expect(result.price).toBe(49.99);
  });

  it("handles string-valued brand", () => {
    const html = `
      <script type="application/ld+json">
        { "@type": "Product", "name": "X", "brand": "IKEA", "offers": { "price": 19 } }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.brandGuess).toBe("IKEA");
  });

  it("handles image as an object with url", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "Product",
          "name": "X",
          "image": { "@type": "ImageObject", "url": "https://cdn.example.com/p.jpg" }
        }
      </script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.image).toBe("https://cdn.example.com/p.jpg");
  });

  it("survives malformed JSON-LD by skipping it", () => {
    const html = `
      <meta property="og:title" content="Producto OG">
      <script type="application/ld+json">{ "bad": json }</script>
    `;
    const result = parseQuickFillHtml(html);
    expect(result.name).toBe("Producto OG");
    expect(result.price).toBeNull();
  });

  it("strips merchant site suffix from titles", () => {
    expect(
      parseQuickFillHtml(`<meta property="og:title" content="Mesa Bekant - IKEA España">`).name,
    ).toBe("Mesa Bekant");
    expect(
      parseQuickFillHtml(`<meta property="og:title" content="Air Fryer XL · MediaMarkt">`).name,
    ).toBe("Air Fryer XL");
  });

  it("does not produce a one-char brand guess", () => {
    const html = `<meta property="og:title" content="X Producto">`;
    const result = parseQuickFillHtml(html);
    expect(result.brandGuess).toBeNull();
  });
});
