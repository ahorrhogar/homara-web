import { editorialTrackingService } from "@/services/editorialTrackingService";
import { canUseAnalytics } from "@/services/cookieConsentService";
import { getSupabaseClient } from "@/integrations/supabase/client";

jest.mock("@/services/cookieConsentService", () => ({
  canUseAnalytics: jest.fn(),
}));

jest.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: jest.fn(),
}));

describe("editorialTrackingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not track without analytics consent", async () => {
    jest.mocked(canUseAnalytics).mockReturnValue(false);

    const rpc = jest.fn().mockResolvedValue({ data: { accepted: true }, error: null });
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await editorialTrackingService.trackArticleView({ slug: "articulo-test" });

    expect(rpc).not.toHaveBeenCalled();
  });

  it("deduplicates repeated article views in local window", async () => {
    jest.mocked(canUseAnalytics).mockReturnValue(true);

    const rpc = jest.fn().mockResolvedValue({ data: { accepted: true }, error: null });
    jest.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });
    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "track_article_view_secure",
      expect.objectContaining({ p_article_slug: "articulo-unico-test" }),
    );
  });
});
