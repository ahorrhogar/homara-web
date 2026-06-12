import {
  detectPriceSwing,
  mapAmazonItem,
  pickListing,
  slugify,
} from "@/domain/catalog/amazon-mapping";
import type { AmazonItem } from "@/infrastructure/amazon/types";

// A realistic home-and-garden item exercising every mapped resource,
// shaped after the Creators API docs' GetItems / OffersV2 examples.
const fullItem: AmazonItem = {
  asin: "B0DXFMCB2G",
  detailPageURL:
    "https://www.amazon.es/dp/B0DXFMCB2G?tag=ahorrhogar-21&linkCode=ogi&th=1&psc=1",
  parentASIN: "B0PARENT01",
  images: {
    primary: {
      medium: { url: "https://m.media-amazon.com/images/I/medium.jpg", height: 160, width: 160 },
      large: { url: "https://m.media-amazon.com/images/I/large.jpg", height: 500, width: 500 },
    },
    variants: [
      { large: { url: "https://m.media-amazon.com/images/I/var1.jpg" } },
      { medium: { url: "https://m.media-amazon.com/images/I/var2.jpg" } },
    ],
  },
  itemInfo: {
    title: { displayValue: "Cecotec Freidora de Aire 5,5L Café & Té", label: "Title", locale: "es_ES" },
    byLineInfo: {
      brand: { displayValue: "Cecotec", label: "Brand", locale: "es_ES" },
      manufacturer: { displayValue: "Cecotec S.A.", label: "Manufacturer", locale: "es_ES" },
    },
    features: {
      displayValues: ["5,5 litros de capacidad", "1700 W de potencia", "Temporizador de 60 min"],
      label: "Features",
      locale: "es_ES",
    },
    externalIds: {
      eans: { displayValues: ["8435484071234", "0717356278525"], label: "EAN", locale: "es_ES" },
    },
    productInfo: {
      color: { displayValue: "Negro", label: "Color", locale: "es_ES" },
      size: { displayValue: "5,5 L", label: "Size", locale: "es_ES" },
      itemDimensions: {
        height: { displayValue: 32, unit: "cm" },
        length: { displayValue: 28, unit: "cm" },
        width: { displayValue: 30, unit: "cm" },
        weight: { displayValue: 5.2, unit: "kg" },
      },
    },
    manufactureInfo: { model: { displayValue: "CECOTEC-5500" } },
    technicalInfo: { energyEfficiencyClass: { displayValue: "A++" } },
  },
  offersV2: {
    listings: [
      {
        availability: { type: "IN_STOCK", minOrderQuantity: 1, maxOrderQuantity: 10 },
        condition: { value: "New", subCondition: "Unknown", conditionNote: "" },
        dealDetails: { accessType: "ALL", badge: "Oferta del día" },
        isBuyBoxWinner: true,
        merchantInfo: { name: "Amazon.es" },
        price: {
          money: { amount: 59.99, currency: "EUR", displayAmount: "59,99 €" },
          savingBasis: { money: { amount: 79.99, currency: "EUR" }, savingBasisType: "LIST_PRICE" },
          savings: { money: { amount: 20, currency: "EUR" }, percentage: 25 },
        },
        type: "LIGHTNING_DEAL",
        violatesMAP: false,
      },
    ],
  },
};

describe("slugify", () => {
  it("strips diacritics, lowercases and hyphenates", () => {
    expect(slugify("Cecotec Freidora de Aire 5,5L Café & Té")).toBe(
      "cecotec-freidora-de-aire-55l-cafe-te",
    );
  });
});

describe("pickListing", () => {
  it("prefers the buy-box winner", () => {
    const item: AmazonItem = {
      asin: "X",
      offersV2: {
        listings: [
          { isBuyBoxWinner: false, price: { money: { amount: 10 } } },
          { isBuyBoxWinner: true, price: { money: { amount: 20 } } },
        ],
      },
    };
    expect(pickListing(item)?.price?.money?.amount).toBe(20);
  });

  it("returns null when there are no listings", () => {
    expect(pickListing({ asin: "X", offersV2: { listings: [] } })).toBeNull();
  });
});

describe("mapAmazonItem", () => {
  const mapped = mapAmazonItem(fullItem);

  it("maps core identity fields", () => {
    expect(mapped.asin).toBe("B0DXFMCB2G");
    expect(mapped.name).toBe("Cecotec Freidora de Aire 5,5L Café & Té");
    expect(mapped.brandName).toBe("Cecotec");
  });

  it("keeps the vended affiliate URL unaltered", () => {
    expect(mapped.detailPageURL).toBe(fullItem.detailPageURL);
  });

  it("selects large primary image and variant images", () => {
    expect(mapped.primaryImageUrl).toBe("https://m.media-amazon.com/images/I/large.jpg");
    expect(mapped.imageUrls).toEqual([
      "https://m.media-amazon.com/images/I/var1.jpg",
      "https://m.media-amazon.com/images/I/var2.jpg",
    ]);
  });

  it("builds specs from meta fields and never sets rating", () => {
    expect(mapped.specs.slug).toBe("cecotec-freidora-de-aire-55l-cafe-te");
    expect(mapped.specs.ean).toBe("8435484071234");
    expect(mapped.specs.color).toBe("Negro");
    expect(mapped.specs.style).toBe("5,5 L");
    expect(mapped.specs.dimensions).toBe("28 cm × 30 cm × 32 cm");
    expect(mapped.specs.weight).toBe("5.2 kg");
    expect(mapped.specs.energyclass).toBe("A++");
    expect(mapped.specs.sku).toBe("CECOTEC-5500");
    expect(mapped.specs).not.toHaveProperty("rating");
  });

  it("records source metadata in attributes", () => {
    expect(mapped.attributes.source).toBe("amazon-creatorsapi");
    expect(mapped.attributes.asin).toBe("B0DXFMCB2G");
    expect(mapped.attributes.parentAsin).toBe("B0PARENT01");
    expect(mapped.attributes.amazonFeatures).toHaveLength(3);
  });

  it("maps the buy-box offer with price, list price and deal", () => {
    expect(mapped.offer.price).toBe(59.99);
    expect(mapped.offer.oldPrice).toBe(79.99);
    expect(mapped.offer.currency).toBe("EUR");
    expect(mapped.offer.inStock).toBe(true);
    expect(mapped.offer.availabilityType).toBe("IN_STOCK");
    expect(mapped.offer.isBuyBoxWinner).toBe(true);
    expect(mapped.offer.savingsPercent).toBe(25);
    expect(mapped.offer.dealBadge).toBe("Oferta del día");
    expect(mapped.offer.offerType).toBe("LIGHTNING_DEAL");
  });

  it("treats an item with no listings as out of stock", () => {
    const noOffer = mapAmazonItem({ asin: "Z", itemInfo: { title: { displayValue: "X" } } });
    expect(noOffer.offer.inStock).toBe(false);
    expect(noOffer.offer.price).toBeNull();
    expect(noOffer.offer.availabilityType).toBe("OUT_OF_STOCK");
  });

  it("falls back to ASIN as name and manufacturer as brand", () => {
    const m = mapAmazonItem({
      asin: "B000",
      itemInfo: { byLineInfo: { manufacturer: { displayValue: "ACME" } } },
    });
    expect(m.name).toBe("B000");
    expect(m.brandName).toBe("ACME");
  });
});

describe("detectPriceSwing", () => {
  it("flags swings beyond the threshold", () => {
    expect(detectPriceSwing(100, 60).flagged).toBe(true);
    expect(detectPriceSwing(100, 90).flagged).toBe(false);
  });

  it("does not flag when a base price is missing", () => {
    expect(detectPriceSwing(null, 50).flagged).toBe(false);
    expect(detectPriceSwing(0, 50).flagged).toBe(false);
  });

  it("reports change without flagging for small moves", () => {
    const r = detectPriceSwing(100, 105);
    expect(r.changed).toBe(true);
    expect(r.flagged).toBe(false);
  });
});
