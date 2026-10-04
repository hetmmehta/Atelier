import { describe, it, expect } from "vitest";
import { validateOutfitItems, validateOutfits } from "@/lib/outfits";

const wardrobe = [{ id: "a1" }, { id: "b2" }, { id: "c3" }];

describe("validateOutfitItems", () => {
  it("keeps known IDs in order", () => {
    const { outfit, droppedIds } = validateOutfitItems({ outfit_name: "Look", item_ids: ["b2", "a1"] }, wardrobe);
    expect(outfit).toEqual({ outfit_name: "Look", item_ids: ["b2", "a1"] });
    expect(droppedIds).toEqual([]);
  });

  it("drops IDs that aren't in the wardrobe and removes duplicates", () => {
    const { outfit, droppedIds } = validateOutfitItems({ item_ids: ["a1", "zzz", "a1", "c3"] }, wardrobe);
    expect(outfit.item_ids).toEqual(["a1", "c3"]);
    expect(droppedIds).toEqual(["zzz"]);
  });

  it("copes with missing or malformed item_ids", () => {
    expect(validateOutfitItems({}, wardrobe).outfit.item_ids).toEqual([]);
    expect(validateOutfitItems({ item_ids: "a1" }, wardrobe).outfit.item_ids).toEqual([]);
    expect(validateOutfitItems(null, wardrobe).outfit.item_ids).toEqual([]);
  });

  it("does not mutate the original outfit", () => {
    const original = { item_ids: ["a1", "nope"] };
    validateOutfitItems(original, wardrobe);
    expect(original.item_ids).toEqual(["a1", "nope"]);
  });
});

describe("validateOutfits", () => {
  it("removes outfits that end up empty", () => {
    const result = validateOutfits(
      [
        { outfit_name: "Real", item_ids: ["a1", "fake"] },
        { outfit_name: "Hallucinated", item_ids: ["fake1", "fake2"] },
      ],
      wardrobe
    );
    expect(result).toEqual([{ outfit_name: "Real", item_ids: ["a1"] }]);
  });

  it("returns an empty list for a non-array response", () => {
    expect(validateOutfits(undefined, wardrobe)).toEqual([]);
    expect(validateOutfits({ item_ids: ["a1"] }, wardrobe)).toEqual([]);
  });

  it("returns nothing when the wardrobe is empty", () => {
    expect(validateOutfits([{ item_ids: ["a1"] }], [])).toEqual([]);
  });
});
