import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import OccasionSelector from "@/components/styleme/OccasionSelector";
import StylePreferences from "@/components/styleme/StylePreferences";
import OutfitResult from "@/components/styleme/OutfitResult";
import { Skeleton } from "@/components/ui/skeleton";

export default function StyleMe() {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("");
  const [preferences, setPreferences] = useState({});
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["clothing"],
    queryFn: () => base44.entities.ClothingItem.list("-created_date"),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["styleProfile"],
    queryFn: () => base44.entities.StyleProfile.list(),
  });

  const profile = profiles[0] || {};

  const generateOutfits = async () => {
    setGenerating(true);
    const wardrobeSummary = items.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      color: i.color,
      subcategory: i.subcategory,
      season: i.season,
      formality: i.formality,
      brand: i.brand,
      size: i.size,
      fit_notes: i.fit_notes,
    }));

    const prompt = `You are an expert fashion stylist. Create 2 complete, realistic, wearable outfit suggestions from this wardrobe.

WARDROBE:
${JSON.stringify(wardrobeSummary, null, 2)}

OCCASION: ${occasion}
MOOD/VIBE: ${preferences.mood || "not specified"}
WEATHER: ${preferences.weather || "not specified"}
COMFORT PRIORITY: ${preferences.comfort || "balanced"}
EXTRA NOTES: ${preferences.extra_notes || "none"}

STYLE PROFILE:
- Body Type: ${profile.body_type || "not specified"}
- Height: ${profile.height_cm ? profile.height_cm + "cm" : profile.height || "not specified"}
- Weight: ${profile.weight_kg ? profile.weight_kg + "kg" : "not specified"}
- Skin Tone: ${profile.skin_tone || "not specified"}
- Preferred Styles: ${(profile.preferred_styles || []).join(", ") || "not specified"}
- Color Preferences: ${(profile.color_preferences || []).join(", ") || "not specified"}
- Gender Expression: ${profile.gender_expression || "not specified"}
- Age Group: ${profile.age_group || "not specified"}
- Climate: ${profile.climate || "not specified"}

STRICT OUTFIT RULES — you MUST follow these:
1. NEVER combine a dress or skirt with jeans or pants. A dress/skirt IS the bottom — do not add another bottom.
2. Every outfit must have at most ONE bottom piece (pants OR skirt OR dress, never two).
3. Every outfit must have at most ONE top piece (unless layering is intentional and realistic, e.g. a shirt under a blazer).
4. Shoes and accessories are optional additions, not required.
5. Only use items whose IDs exist in the wardrobe list above. Do not invent or guess IDs.
6. If the wardrobe has limited items, create the best possible outfit from what exists — do not force combinations that don't make sense.
7. Consider color harmony — complementary or matching colors only.
8. Consider the body type and choose flattering silhouettes.

For layering_order: describe the order to PUT ON each item (e.g., "1. Put on the white tee first, 2. Layer the blazer over it, 3. Step into the jeans, 4. Put on the white sneakers").`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
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
      },
    });

    setOutfits(result.outfits || []);
    setGenerating(false);
    setStep(3);
  };

  const handleSaveOutfit = async (outfit) => {
    await base44.entities.SavedOutfit.create({
      name: outfit.outfit_name,
      occasion,
      clothing_item_ids: outfit.item_ids,
      styling_notes: outfit.styling_advice + "\n\nLayering:\n" + (outfit.layering_order || []).join("\n") + "\n\nTips:\n" + (outfit.styling_tips || []).join("\n"),
    });
    queryClient.invalidateQueries({ queryKey: ["savedOutfits"] });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-5 gap-3">
          {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Style Me</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI-powered outfit curation from your wardrobe</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {s === 1 ? "Occasion" : s === 2 ? "Preferences" : "Outfits"}
            </span>
            {s < 3 && <div className={`w-8 h-px ${s < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-medium mb-1">What's the occasion?</h2>
            <p className="text-sm text-muted-foreground">Choose what you're dressing for and we'll curate the perfect look.</p>
          </div>
          <OccasionSelector selected={occasion} onSelect={setOccasion} />
          {items.length === 0 && (
            <p className="text-sm text-destructive">You need to add clothing items to your wardrobe first!</p>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!occasion || items.length === 0} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-medium mb-1">Fine-tune your style</h2>
            <p className="text-sm text-muted-foreground">Help us understand the vibe you're going for.</p>
          </div>
          <StylePreferences preferences={preferences} onChange={setPreferences} />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={generateOutfits} disabled={generating} className="gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Creating looks...</> : <><Sparkles className="w-4 h-4" />Generate Outfits</>}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-medium mb-1">Your curated looks</h2>
            <p className="text-sm text-muted-foreground">Here are outfits styled just for you. Hit "See on Model" to visualize!</p>
          </div>
          {outfits.map((outfit, i) => (
            <OutfitResult
              key={i}
              outfit={outfit}
              allItems={items}
              profile={profile}
              onSave={() => handleSaveOutfit(outfit)}
              onRegenerate={() => { setStep(2); setOutfits([]); }}
            />
          ))}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => { setStep(1); setOutfits([]); }} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Start Over
            </Button>
            <Button onClick={generateOutfits} disabled={generating} variant="outline" className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}