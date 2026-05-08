/** @jest-environment node */
import { getSupabaseClient } from "@/integrations/supabase/client";
import { listEditorialArticles, upsertEditorialArticle } from "@/admin/services/adminEditorialService";

jest.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

describe("adminEditorialService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps editorial rows in listEditorialArticles", async () => {
    const queryResult = {
      data: [
        {
          id: "art-1",
          slug: "slug-test",
          path: "/blog/slug-test",
          title: "Titulo test",
          excerpt: "Extracto test",
          cover_image: null,
          cover_image_alt: null,
          cover_tone: "fresh",
          category_slug: "cocina",
          category_name: "Cocina",
          intent: "comparativa",
          tags: ["tag-1"],
          read_minutes: 10,
          average_budget: 120,
          related_category_slugs: ["cocina"],
          related_product_slugs: [],
          published_at: "2026-04-20T00:00:00.000Z",
          updated_at: "2026-04-20T00:00:00.000Z",
          views_count: 14,
          is_featured: true,
          status: "published",
          sections: [{ heading: "H1", body: "Body" }],
        },
      ],
      count: 1,
      error: null,
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    const select = jest.fn().mockReturnValue(queryResult);
    const from = jest.fn().mockReturnValue({ select });

    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    const result = await listEditorialArticles({ page: 1, pageSize: 20 });

    expect(result.total).toBe(1);
    expect(result.rows[0]?.slug).toBe("slug-test");
    expect(result.rows[0]?.views).toBe(14);
  });

  it("normalizes slug/path on upsertEditorialArticle", async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: "art-2",
        slug: "mi-articulo-de-prueba",
        path: "/blog/mi-articulo-de-prueba",
        title: "Mi articulo de prueba",
        excerpt: "Extracto suficientemente largo para pasar validaciones de prueba",
        cover_image: null,
        cover_image_alt: null,
        cover_tone: "fresh",
        category_slug: "electrodomesticos",
        category_name: "Electrodomesticos",
        intent: "comparativa",
        tags: ["test"],
        read_minutes: 9,
        average_budget: 99,
        related_category_slugs: ["electrodomesticos"],
        related_product_slugs: [],
        published_at: "2026-04-20T00:00:00.000Z",
        updated_at: "2026-04-20T00:00:00.000Z",
        views_count: 0,
        is_featured: false,
        status: "draft",
        sections: [{ heading: "Resumen", body: "Contenido" }],
      },
      error: null,
    });

    const select = jest.fn().mockReturnValue({ single });
    const upsert = jest.fn().mockReturnValue({ select });
    const insert = jest.fn().mockResolvedValue({ error: null });

    const from = jest.fn((table: string) => {
      if (table === "editorial_articles") {
        return { upsert };
      }

      if (table === "admin_actions") {
        return { insert };
      }

      return {};
    });

    jest.mocked(getSupabaseClient).mockReturnValue({ from } as never);

    const result = await upsertEditorialArticle({
      title: "Mi articulo de prueba",
      excerpt: "Extracto suficientemente largo para pasar validaciones de prueba",
      categoryName: "Electrodomesticos",
      categorySlug: "electrodomesticos",
      intent: "comparativa",
      status: "draft",
      isFeatured: false,
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "mi-articulo-de-prueba",
        path: "/blog/mi-articulo-de-prueba",
      }),
    );
    expect(result.slug).toBe("mi-articulo-de-prueba");
  });
});
