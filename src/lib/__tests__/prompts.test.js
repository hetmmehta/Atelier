import { describe, it, expect } from "vitest";
import {
  summarizeWardrobe,
  summarizeProfile,
  buildStyleMePrompt,
  buildQuickPickPrompt,
} from "@/lib/prompts";

const items = [
  { id: "a1", name: "White Tee", category: "tops", color: "white", image_url: "https://x/1.jpg", created_date: "2025-01-01" },
  { id: "b2", name: "Blue Jeans", category: "bottoms", color: "blue", brand: "", size: "32" },
];

describe("summarizeWardrobe", () => {
  it("keeps prompt fields and drops images, metadata and empty values", () => {
    expect(summarizeWardrobe(items)).toEqual([
      { id: "a1", name: "White Tee", category: "tops", color: "white" },
      { id: "b2", name: "Blue Jeans", category: "bottoms", color: "blue", size: "32" },
    ]);
  });

  it("handles a missing wardrobe", () => {
    expect(summarizeWardrobe()).toEqual([]);
  });
});

describe("summarizeProfile", () => {
  it("falls back to 'not specified' for an empty profile", () => {
    const text = summarizeProfile({});
    expect(text).toContain("- Body Type: not specified");
    expect(text).toContain("- Height: not specified");
    expect(text).toContain("- Colors to Avoid: none");
  });

  it("formats measurements and lists", () => {
    const text = summarizeProfile({
      body_type: "pear",
      height_cm: 165,
      weight_kg: 60,
      preferred_styles: ["Classic", "Minimalist"],
      avoid_colors: ["Neon Green"],
    });
    expect(text).toContain("- Body Type: pear");
    expect(text).toContain("- Height: 165cm");
    expect(text).toContain("- Weight: 60kg");
    expect(text).toContain("- Preferred Styles: Classic, Minimalist");
    expect(text).toContain("- Colors to Avoid: Neon Green");
  });

  it("uses the height category when no cm value is set", () => {
    expect(summarizeProfile({ height: "petite" })).toContain("- Height: petite");
  });
});

describe("buildStyleMePrompt", () => {
  const prompt = buildStyleMePrompt({
    items,
    profile: { skin_tone: "warm olive" },
    occasion: "date night",
    preferences: { mood: "bold" },
  });

  it("includes the wardrobe IDs, occasion, preferences and profile", () => {
    expect(prompt).toContain('"id": "a1"');
    expect(prompt).toContain("OCCASION: date night");
    expect(prompt).toContain("MOOD/VIBE: bold");
    expect(prompt).toContain("WEATHER: not specified");
    expect(prompt).toContain("- Skin Tone: warm olive");
  });

  it("asks for 2 outfits and includes the outfit rules", () => {
    expect(prompt).toContain("Create 2 complete");
    expect(prompt).toContain("Do not invent or guess IDs");
  });
});

describe("buildQuickPickPrompt", () => {
  it("asks for a single outfit with the shared profile and rules", () => {
    const prompt = buildQuickPickPrompt({ items, profile: { body_type: "athletic" }, occasion: "work" });
    expect(prompt).toContain("pick ONE best outfit");
    expect(prompt).toContain("OCCASION: work");
    expect(prompt).toContain("- Body Type: athletic");
    expect(prompt).toContain('"id":"b2"');
    expect(prompt).toContain("Do not invent or guess IDs");
  });
});
