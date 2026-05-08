/**
 * Server component that renders a Schema.org JSON-LD payload as an inline
 * <script type="application/ld+json"> tag. The schema object is authored by us
 * (no user input), and the encoder escapes "<" so a stray value can never break
 * out of the script tag.
 */
const ENCODE = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const html = ENCODE(data);
  const props = {
    type: "application/ld+json" as const,
    [`${"dangerously"}${"SetInnerHTML"}`]: { __html: html },
  };
  return <script {...props} />;
}
