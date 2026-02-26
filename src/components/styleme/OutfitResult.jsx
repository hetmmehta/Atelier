import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkPlus, RefreshCw, Sparkles, Loader2, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OutfitResult({ outfit, allItems, profile, onSave, onRegenerate }) {
  const [modelImageUrl, setModelImageUrl] = useState(null);
  const [generatingModel, setGeneratingModel] = useState(false);
  const [modelError, setModelError] = useState(null);

  const outfitItems = (outfit.item_ids || [])
    .map((id) => allItems.find((i) => i.id === id))
    .filter(Boolean);

  const generateModelVisual = async () => {
    setGeneratingModel(true);
    setModelImageUrl(null);

    // Separate items by category for a clean, non-contradictory description
    const tops = outfitItems.filter(i => ["tops", "outerwear", "activewear"].includes(i.category));
    const bottoms = outfitItems.filter(i => ["bottoms"].includes(i.category));
    const dresses = outfitItems.filter(i => ["dresses"].includes(i.category));
    const shoes = outfitItems.filter(i => i.category === "shoes");
    const accessories = outfitItems.filter(i => ["accessories", "bags"].includes(i.category));

    // Build a clean, simple outfit description that won't confuse the image generator
    const parts = [];

    if (dresses.length > 0) {
      // Dress outfit — never mention pants/bottoms separately
      const dress = dresses[0];
      parts.push(`a ${dress.color || ""} ${dress.subcategory || "dress"}`.trim());
      // Layer outerwear ONLY if present
      tops.filter(t => t.category === "outerwear").forEach(t => {
        parts.push(`a ${t.color || ""} ${t.subcategory || t.category} worn open over the dress`.trim());
      });
    } else {
      // Top + bottom outfit
      if (tops.length > 0) {
        const top = tops[0];
        parts.push(`a ${top.color || ""} ${top.subcategory || top.category}`.trim());
        if (tops.length > 1) {
          const layer = tops[1];
          parts.push(`a ${layer.color || ""} ${layer.subcategory || layer.category} layered on top`.trim());
        }
      }
      if (bottoms.length > 0) {
        const bottom = bottoms[0];
        parts.push(`${bottom.color || ""} ${bottom.subcategory || bottom.category}`.trim());
      }
    }

    if (shoes.length > 0) {
      parts.push(`${shoes[0].color || ""} ${shoes[0].subcategory || "shoes"}`.trim());
    }
    if (accessories.length > 0) {
      parts.push(`${accessories[0].color || ""} ${accessories[0].subcategory || accessories[0].category}`.trim());
    }

    const outfitDesc = parts.join(", ");

    const bodyDesc = profile?.body_type
      ? `${profile.body_type.replace(/_/g, " ")} body type${profile.height_cm ? ", " + profile.height_cm + "cm tall" : ""}${profile.weight_kg ? ", " + profile.weight_kg + "kg" : ""}`
      : "average build";

    const skinDesc = profile?.skin_tone ? `, ${profile.skin_tone} skin` : "";
    const genderDesc = profile?.gender_expression === "masculine" ? "male" : profile?.gender_expression === "androgynous" ? "androgynous" : "female";

    // Use the actual clothing item images as reference so the generator uses those exact pieces
    const referenceImageUrls = outfitItems.map(i => i.image_url).filter(Boolean);

    const prompt = `Fashion editorial photo of a ${genderDesc} model with ${bodyDesc}${skinDesc}, wearing EXACTLY the clothing items shown in the reference images: ${outfitDesc}. The model must be wearing those exact garments — same colors, same patterns, same styles as shown. Full body visible, clean white studio background, soft fashion lighting, realistic photography.`;

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: referenceImageUrls,
      });
      setModelImageUrl(result.url);
    } catch (e) {
      setModelError("Couldn't generate model image. Try regenerating the outfit.");
    }
    setGeneratingModel(false);
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Clothing items */}
          <div className="flex gap-3 overflow-x-auto pb-2 flex-shrink-0">
            {outfitItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-24 md:w-28">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium mt-1.5 truncate">{item.name}</p>
                {item.brand && <p className="text-[10px] text-muted-foreground truncate">{item.brand}</p>}
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                  {item.size && <Badge variant="outline" className="text-[10px]">{item.size}</Badge>}
                </div>
              </div>
            ))}
          </div>

          {/* Styling Notes */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-display text-lg font-semibold">{outfit.outfit_name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{outfit.styling_advice}</p>
            </div>

            {outfit.layering_order && outfit.layering_order.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">How to Layer</p>
                <ol className="space-y-1.5">
                  {outfit.layering_order.map((step, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {outfit.styling_tips && outfit.styling_tips.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Styling Tips</p>
                <ul className="space-y-1.5">
                  {outfit.styling_tips.map((tip, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onSave}>
                <BookmarkPlus className="w-3.5 h-3.5" />
                Save Outfit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => { setModelError(null); generateModelVisual(); }}
                disabled={generatingModel}
              >
                {generatingModel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />}
                {generatingModel ? "Generating..." : "See on Model"}
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRegenerate}>
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </Button>
            </div>
          </div>
        </div>

        {/* Model preview */}
        {(generatingModel || modelImageUrl) && (
          <div className="border-t pt-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Model Preview — Styled for Your Body
            </p>
            {generatingModel ? (
              <div className="flex items-center justify-center h-80 bg-muted rounded-2xl">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Rendering your look on a model…</p>
                  <p className="text-xs text-muted-foreground">This takes ~10 seconds</p>
                </div>
              </div>
            ) : modelError ? (
              <div className="flex flex-col items-center justify-center h-40 bg-muted/50 rounded-2xl gap-3">
                <p className="text-sm text-muted-foreground">{modelError}</p>
                <Button variant="outline" size="sm" onClick={() => { setModelError(null); generateModelVisual(); }} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Try Again
                </Button>
              </div>
            ) : (
              <img
                src={modelImageUrl}
                alt="Outfit on model"
                className="w-full max-w-sm mx-auto rounded-2xl object-cover shadow-lg"
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}