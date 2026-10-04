// Prompt builders for the outfit features (Style Me and Quick Pick).
// Kept as pure functions so they can be unit tested without the Base44 SDK.

const NOT_SPECIFIED = "not specified";

const WARDROBE_FIELDS = [
  "id",
  "name",
  "category",
  "color",
  "subcategory",
  "season",
  "formality",
  "brand",
  "size",
  "fit_notes",
];

/**
 * Reduce wardrobe items to the fields the stylist prompt needs.
 * Empty fields are omitted to keep the prompt short.
 */
export function summarizeWardrobe(items = []) {
  return items.map((item) => {
    const summary = {};
    for (const field of WARDROBE_FIELDS) {
      const value = item[field];
      if (value !== undefined && value !== null && value !== "") {
        summary[field] = value;
      }
    }
    return summary;
  });
}

const joinList = (list, fallback = NOT_SPECIFIED) =>
  Array.isArray(list) && list.length > 0 ? list.join(", ") : fallback;

function formatHeight(profile) {
  if (profile.height_cm) return `${profile.height_cm}cm`;
  return profile.height || NOT_SPECIFIED;
}

/**
 * Turn a StyleProfile record into a "- Label: value" block for prompts.
 */
export function summarizeProfile(profile = {}) {
  const lines = [
    ["Body Type", profile.body_type],
    ["Height", formatHeight(profile)],
    ["Weight", profile.weight_kg ? `${profile.weight_kg}kg` : null],
    ["Skin Tone", profile.skin_tone],
    ["Preferred Styles", joinList(profile.preferred_styles)],
    ["Color Preferences", joinList(profile.color_preferences)],
    ["Colors to Avoid", joinList(profile.avoid_colors, "none")],
    ["Gender Expression", profile.gender_expression],
    ["Age Group", profile.age_group],
    ["Climate", profile.climate],
  ];
  return lines.map(([label, value]) => `- ${label}: ${value || NOT_SPECIFIED}`).join("\n");
}

const OUTFIT_RULES = `STRICT OUTFIT RULES — you MUST follow these:
1. NEVER combine a dress or skirt with jeans or pants. A dress/skirt IS the bottom — do not add another bottom.
2. Every outfit must have at most ONE bottom piece (pants OR skirt OR dress, never two).
3. Every outfit must have at most ONE top piece (unless layering is intentional and realistic, e.g. a shirt under a blazer).
4. Shoes and accessories are optional additions, not required.
5. Only use items whose IDs exist in the wardrobe list above. Do not invent or guess IDs.
6. If the wardrobe has limited items, create the best possible outfit from what exists — do not force combinations that don't make sense.
7. Consider color harmony — complementary or matching colors only.
8. Consider the body type and choose flattering silhouettes.`;

export function buildStyleMePrompt({ items, profile, occasion, preferences = {} }) {
  return `You are an expert fashion stylist. Create 2 complete, realistic, wearable outfit suggestions from this wardrobe.

WARDROBE:
${JSON.stringify(summarizeWardrobe(items), null, 2)}

OCCASION: ${occasion}
MOOD/VIBE: ${preferences.mood || NOT_SPECIFIED}
WEATHER: ${preferences.weather || NOT_SPECIFIED}
COMFORT PRIORITY: ${preferences.comfort || "balanced"}
EXTRA NOTES: ${preferences.extra_notes || "none"}

STYLE PROFILE:
${summarizeProfile(profile)}

${OUTFIT_RULES}

For layering_order: describe the order to PUT ON each item (e.g., "1. Put on the white tee first, 2. Layer the blazer over it, 3. Step into the jeans, 4. Put on the white sneakers").`;
}

export function buildQuickPickPrompt({ items, profile, occasion }) {
  return `You are a quick fashion stylist. Given the user's wardrobe, pick ONE best outfit for the occasion. Be decisive and concise.

WARDROBE:
${JSON.stringify(summarizeWardrobe(items))}

OCCASION: ${occasion}

STYLE PROFILE:
${summarizeProfile(profile)}

${OUTFIT_RULES}

Pick the BEST single outfit. Give a short, punchy recommendation and ONE key styling suggestion.`;
}

export const STYLE_ME_SCHEMA = {
  type: "object",
  properties: {
    outfits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          outfit_name: { type: "string" },
          item_ids: { type: "array", items: { type: "string" } },
          styling_advice: { type: "string" },
          layering_order: { type: "array", items: { type: "string" } },
          styling_tips: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

export const QUICK_PICK_SCHEMA = {
  type: "object",
  properties: {
    outfit_name: { type: "string" },
    item_ids: { type: "array", items: { type: "string" } },
    why_it_works: { type: "string" },
    key_tip: { type: "string" },
    confidence: { type: "string", enum: ["Perfect Match", "Great Choice", "Good Option"] },
  },
};
