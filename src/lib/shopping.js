// Shopping helpers for Shop & Discover. The LLM suggests items (brand, name,
// estimated price); links and budget filtering are done here in code so we
// never show a made-up product URL or an item outside the chosen budget.

/**
 * Parse a budget label such as "Under $50", "$50–$200" or "$500+" into
 * a numeric { min, max } range in USD. Returns null if no range can be read.
 */
export function parseBudgetRange(label) {
  if (typeof label !== "string") return null;
  const numbers = (label.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (numbers.length === 0) return null;

  if (/under|below|less than|up to/i.test(label)) {
    return { min: 0, max: numbers[0] };
  }
  if (numbers.length >= 2) {
    return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  }
  if (/\+|over|above|more than/i.test(label)) {
    return { min: numbers[0], max: Infinity };
  }
  return null;
}

/**
 * Read a price from a number or a string like "$49.99" or "USD 1,299".
 * For a range like "$40–$60" the lower bound is used. Returns null if unknown.
 */
export function parsePrice(value) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/**
 * Keep only recommendations whose estimated price falls inside the range.
 * Items without a readable price are excluded when a budget is set, since
 * we can't confirm they fit.
 */
export function filterByBudget(recommendations, range) {
  const list = Array.isArray(recommendations) ? recommendations : [];
  if (!range) return { items: list, excludedCount: 0 };

  const items = list.filter((rec) => {
    const price = parsePrice(rec.price_usd);
    return price !== null && price >= range.min && price <= range.max;
  });
  return { items, excludedCount: list.length - items.length };
}

/**
 * Build a real search link for an item instead of trusting an LLM-made URL.
 */
export function buildShoppingSearchUrl(brand, itemName) {
  const query = [brand, itemName].filter(Boolean).join(" ").trim();
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

/**
 * Attach search links and apply the budget filter to an LLM response.
 */
export function prepareRecommendations(recommendations, budgetLabel) {
  const withLinks = (Array.isArray(recommendations) ? recommendations : [])
    .filter((rec) => rec && rec.item_name)
    .map((rec) => ({ ...rec, search_url: buildShoppingSearchUrl(rec.brand, rec.item_name) }));
  return filterByBudget(withLinks, parseBudgetRange(budgetLabel));
}

export function formatPrice(value) {
  const price = parsePrice(value);
  if (price === null) return null;
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
}

export function buildShoppingPrompt({ profile = {}, brands = [], budgetLabel, saleOnly = false }) {
  const brandList = brands.length > 0 ? brands.join(", ") : "popular fashion brands";
  return `You are a personal shopping assistant. Based on the user's style profile, suggest specific clothing items they could buy.

USER PROFILE:
- Favorite Brands: ${brandList}
- Budget: ${budgetLabel || "any budget"}
- Style Preferences: ${(profile.preferred_styles || []).join(", ") || "classic, modern"}
- Color Preferences: ${(profile.color_preferences || []).join(", ") || "neutrals"}
- Skin Tone: ${profile.skin_tone || "not specified"}
- Body Type: ${profile.body_type || "not specified"}
- Gender Expression: ${profile.gender_expression || "feminine"}
- Sale/Deals Only: ${saleOnly ? "YES - prefer items that are typically discounted or currently on sale" : "no preference"}

Suggest 6 specific clothing items from these brands. For each:
1. Give the brand and a specific, searchable item name (e.g. "Linen Blend Oversized Blazer").
2. Give an estimated price in US dollars as a plain number (price_usd), within the budget. If it is on sale, also give the usual price as original_price_usd.
3. Explain why it suits their style profile and skin tone.

Do NOT include any URLs. Focus on what's currently trending at these brands.`;
}

export const SHOPPING_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          brand: { type: "string" },
          price_usd: { type: "number" },
          original_price_usd: { type: "number" },
          is_sale: { type: "boolean" },
          why_for_you: { type: "string" },
          category: { type: "string" },
          color: { type: "string" },
        },
      },
    },
    trend_note: { type: "string" },
  },
};
