import { describe, it, expect } from "vitest";
import {
  parseBudgetRange,
  parsePrice,
  filterByBudget,
  buildShoppingSearchUrl,
  prepareRecommendations,
  formatPrice,
  buildShoppingPrompt,
} from "@/lib/shopping";

describe("buildShoppingSearchUrl", () => {
  it("builds a Google Shopping search for brand + item name", () => {
    expect(buildShoppingSearchUrl("Zara", "Linen Blazer")).toBe(
      "https://www.google.com/search?tbm=shop&q=Zara%20Linen%20Blazer"
    );
  });

  it("encodes special characters", () => {
    const url = new URL(buildShoppingSearchUrl("H&M", "Wide-Leg Trousers / Black"));
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("tbm")).toBe("shop");
    expect(url.searchParams.get("q")).toBe("H&M Wide-Leg Trousers / Black");
  });

  it("works without a brand", () => {
    expect(buildShoppingSearchUrl("", "Trench Coat")).toBe(
      "https://www.google.com/search?tbm=shop&q=Trench%20Coat"
    );
  });
});

describe("parseBudgetRange", () => {
  it.each([
    ["Under $30", { min: 0, max: 30 }],
    ["Under $50", { min: 0, max: 50 }],
    ["$30–$100", { min: 30, max: 100 }],
    ["$50-$200", { min: 50, max: 200 }],
    ["$600+", { min: 600, max: Infinity }],
    ["$1,000+", { min: 1000, max: Infinity }],
  ])("parses %s", (label, expected) => {
    expect(parseBudgetRange(label)).toEqual(expected);
  });

  it.each([[""], ["any budget"], [null], [undefined], ["$100"]])("returns null for %s", (label) => {
    expect(parseBudgetRange(label)).toBeNull();
  });
});

describe("parsePrice", () => {
  it("reads numbers and price strings", () => {
    expect(parsePrice(49.99)).toBe(49.99);
    expect(parsePrice("$49.99")).toBe(49.99);
    expect(parsePrice("USD 1,299")).toBe(1299);
    expect(parsePrice("$40–$60")).toBe(40);
  });

  it("returns null for unreadable values", () => {
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice("call for price")).toBeNull();
    expect(parsePrice(NaN)).toBeNull();
    expect(parsePrice(-5)).toBeNull();
  });
});

describe("filterByBudget", () => {
  const recs = [
    { item_name: "Tee", price_usd: 25 },
    { item_name: "Jacket", price_usd: 120 },
    { item_name: "Boots", price_usd: "$100" },
    { item_name: "Mystery" },
  ];

  it("keeps only items priced inside the range (inclusive)", () => {
    const { items, excludedCount } = filterByBudget(recs, { min: 30, max: 100 });
    expect(items.map((r) => r.item_name)).toEqual(["Boots"]);
    expect(excludedCount).toBe(3);
  });

  it("handles open-ended ranges", () => {
    const { items } = filterByBudget(recs, { min: 100, max: Infinity });
    expect(items.map((r) => r.item_name)).toEqual(["Jacket", "Boots"]);
  });

  it("returns everything when no budget is set", () => {
    expect(filterByBudget(recs, null)).toEqual({ items: recs, excludedCount: 0 });
  });

  it("handles a non-array input", () => {
    expect(filterByBudget(undefined, { min: 0, max: 50 })).toEqual({ items: [], excludedCount: 0 });
  });
});

describe("prepareRecommendations", () => {
  it("adds search links, ignores any LLM url, and applies the budget label", () => {
    const { items, excludedCount } = prepareRecommendations(
      [
        { brand: "Uniqlo", item_name: "Oxford Shirt", price_usd: 40, url: "https://made-up.example/p/123" },
        { brand: "Gucci", item_name: "Loafers", price_usd: 900 },
        { brand: "Zara" },
      ],
      "Under $50"
    );
    expect(items).toHaveLength(1);
    expect(items[0].search_url).toBe("https://www.google.com/search?tbm=shop&q=Uniqlo%20Oxford%20Shirt");
    expect(excludedCount).toBe(1);
  });

  it("does not filter when there is no budget", () => {
    const { items } = prepareRecommendations([{ brand: "A", item_name: "B", price_usd: 5000 }], "");
    expect(items).toHaveLength(1);
  });
});

describe("formatPrice", () => {
  it("formats whole and fractional dollars", () => {
    expect(formatPrice(40)).toBe("$40");
    expect(formatPrice(39.5)).toBe("$39.50");
    expect(formatPrice(undefined)).toBeNull();
  });
});

describe("buildShoppingPrompt", () => {
  it("includes brands and budget and forbids URLs", () => {
    const prompt = buildShoppingPrompt({ brands: ["Zara", "Mango"], budgetLabel: "Under $50" });
    expect(prompt).toContain("Favorite Brands: Zara, Mango");
    expect(prompt).toContain("Budget: Under $50");
    expect(prompt).toContain("Do NOT include any URLs");
    expect(prompt).not.toMatch(/realistic and plausible/i);
  });
});
