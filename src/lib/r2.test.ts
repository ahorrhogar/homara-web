/**
 * @jest-environment node
 */
const mockSend = jest.fn().mockResolvedValue({});
const putKeys: string[] = [];

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn((input: { Key: string }) => {
    putKeys.push(input.Key);
    return { __type: "put", input };
  }),
  DeleteObjectCommand: jest.fn((input: unknown) => ({ __type: "delete", input })),
}));

// Passthrough sharp: toBuffer returns the input unchanged so hashes are
// deterministic and dedupe is observable.
jest.mock("sharp", () => {
  return jest.fn((buf: Buffer) => {
    const api = {
      rotate: () => api,
      resize: () => api,
      webp: () => api,
      toBuffer: async () => buf,
    };
    return api;
  });
});

const PUBLIC = "https://cdn.homara.es";

function setEnv() {
  process.env.R2_ACCOUNT_ID = "acc";
  process.env.R2_ACCESS_KEY_ID = "key";
  process.env.R2_SECRET_ACCESS_KEY = "secret";
  process.env.R2_BUCKET = "products";
  process.env.R2_PUBLIC_BASE_URL = PUBLIC;
}

function mockFetchOk(bytes: string, contentType = "image/jpeg") {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? contentType : null) },
    arrayBuffer: async () => new TextEncoder().encode(bytes).buffer,
  }) as unknown as typeof fetch;
}

describe("r2", () => {
  beforeEach(() => {
    jest.resetModules();
    setEnv();
    mockSend.mockClear();
    putKeys.length = 0;
  });

  it("rehosts a remote image and returns a cdn url", async () => {
    const { rehostRemoteImage } = await import("./r2");
    mockFetchOk("imagebytes");
    const result = await rehostRemoteImage("https://m.media-amazon.com/images/x.jpg", "products");
    expect(result.rehosted).toBe(true);
    expect(result.url.startsWith(`${PUBLIC}/products/`)).toBe(true);
    expect(result.url.endsWith(".webp")).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("falls back to the original url on a non-2xx response", async () => {
    const { rehostRemoteImage } = await import("./r2");
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as unknown as typeof fetch;
    const original = "https://example.com/missing.jpg";
    const result = await rehostRemoteImage(original, "products");
    expect(result.rehosted).toBe(false);
    expect(result.url).toBe(original);
    expect(result.warning).toContain("404");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("falls back when the fetch throws", async () => {
    const { rehostRemoteImage } = await import("./r2");
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;
    const original = "https://example.com/x.jpg";
    const result = await rehostRemoteImage(original, "products");
    expect(result.rehosted).toBe(false);
    expect(result.url).toBe(original);
  });

  it("passes cdn urls through without re-uploading", async () => {
    const { rehostRemoteImage } = await import("./r2");
    global.fetch = jest.fn() as unknown as typeof fetch;
    const cdnUrl = `${PUBLIC}/products/abc.webp`;
    const result = await rehostRemoteImage(cdnUrl, "products");
    expect(result.rehosted).toBe(true);
    expect(result.url).toBe(cdnUrl);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("dedupes identical bytes to a single object key", async () => {
    const { uploadToR2 } = await import("./r2");
    const a = await uploadToR2("products", Buffer.from("same"), "image/jpeg");
    const b = await uploadToR2("products", Buffer.from("same"), "image/jpeg");
    const c = await uploadToR2("products", Buffer.from("different"), "image/jpeg");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    // Same key uploaded twice, different key once.
    expect(new Set(putKeys).size).toBe(2);
  });

  it("isR2Url recognises only the configured public base", async () => {
    const { isR2Url } = await import("./r2");
    expect(isR2Url(`${PUBLIC}/products/x.webp`)).toBe(true);
    expect(isR2Url("https://m.media-amazon.com/x.jpg")).toBe(false);
  });
});
