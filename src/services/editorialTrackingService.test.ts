import { editorialTrackingService } from "@/services/editorialTrackingService";
import { canUseAnalytics } from "@/services/cookieConsentService";

jest.mock("@/services/cookieConsentService", () => ({
  canUseAnalytics: jest.fn(),
}));

const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe("editorialTrackingService", () => {
  it("does not track without analytics consent", async () => {
    jest.mocked(canUseAnalytics).mockReturnValue(false);

    await editorialTrackingService.trackArticleView({ slug: "articulo-test" });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deduplicates repeated article views in local window", async () => {
    jest.mocked(canUseAnalytics).mockReturnValue(true);

    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });
    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/track/article-view");
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.slug).toBe("articulo-unico-test");
  });
});
