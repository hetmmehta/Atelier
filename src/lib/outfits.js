// Guards for LLM-generated outfits. The model is told to only use wardrobe IDs,
// but nothing enforces that, so every outfit is checked against the real wardrobe.

/**
 * Keep only item IDs that exist in the wardrobe, in order, without duplicates.
 * Returns the cleaned outfit plus the IDs that were dropped.
 */
export function validateOutfitItems(outfit, wardrobeItems = []) {
  const knownIds = new Set(wardrobeItems.map((item) => item.id));
  const seen = new Set();
  const itemIds = [];
  const droppedIds = [];

  for (const id of Array.isArray(outfit?.item_ids) ? outfit.item_ids : []) {
    if (knownIds.has(id) && !seen.has(id)) {
      itemIds.push(id);
      seen.add(id);
    } else if (!knownIds.has(id)) {
      droppedIds.push(id);
    }
  }

  return { outfit: { ...outfit, item_ids: itemIds }, droppedIds };
}

/**
 * Validate a list of outfits and drop any that end up with no real items.
 */
export function validateOutfits(outfits, wardrobeItems = []) {
  if (!Array.isArray(outfits)) return [];
  return outfits
    .map((outfit) => validateOutfitItems(outfit, wardrobeItems).outfit)
    .filter((outfit) => outfit.item_ids.length > 0);
}
