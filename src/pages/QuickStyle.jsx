import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Zap } from "lucide-react";
import OccasionSelector from "@/components/styleme/OccasionSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { buildQuickPickPrompt, QUICK_PICK_SCHEMA } from "@/lib/prompts";
import { validateOutfitItems } from "@/lib/outfits";
import { toast } from "@/components/ui/use-toast";

export default function QuickStyle() {
  const [occasion, setOccasion] = useState("");
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["clothing"],
    queryFn: () => base44.entities.ClothingItem.list("-created_date"),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["styleProfile"],
    queryFn: () => base44.entities.StyleProfile.list(),
  });

  const profile = profiles[0] || {};

  const generateQuick = async () => {
    if (!occasion || items.length === 0) return;
    setGenerating(true);
    setResult(null);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildQuickPickPrompt({ items, profile, occasion }),
        response_json_schema: QUICK_PICK_SCHEMA,
      });

      const { outfit } = validateOutfitItems(res, items);
      if (outfit.item_ids.length === 0) {
        toast({
          variant: "destructive",
          title: "No outfit could be built",
          description: "The stylist didn't pick any items from your wardrobe. Give it another try.",
        });
        return;
      }

      setResult(outfit);
    } catch (error) {
      console.error("Quick pick failed", error);
      toast({
        variant: "destructive",
        title: "Couldn't pick an outfit",
        description: "Something went wrong talking to the stylist. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const outfitItems = result
    ? result.item_ids.map((id) => items.find((i) => i.id === id)).filter(Boolean)
    : [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-5 gap-3 mt-6">
          {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Quick Pick</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Pick an occasion and we'll instantly pull the best outfit from your closet — no scrolling needed.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wider">Where are you headed?</h2>
          <OccasionSelector selected={occasion} onSelect={setOccasion} />
        </div>

        {items.length === 0 && (
          <p className="text-sm text-destructive">Add clothes to your wardrobe first to use Quick Pick.</p>
        )}

        <Button
          onClick={generateQuick}
          disabled={!occasion || items.length === 0 || generating}
          className="w-full gap-2 h-12 text-base"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Finding your best look...</>
          ) : (
            <><Sparkles className="w-5 h-5" />Pick My Outfit</>
          )}
        </Button>

        {result && outfitItems.length > 0 && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-display text-xl font-semibold">{result.outfit_name}</h3>
                <Badge className="mt-1 text-xs">{result.confidence}</Badge>
              </div>
            </div>

            {/* Items */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {outfitItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-28">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-medium mt-1.5 truncate">{item.name}</p>
                  {item.brand && <p className="text-[10px] text-muted-foreground">{item.brand}</p>}
                  {item.size && <Badge variant="outline" className="text-[10px] mt-0.5">{item.size}</Badge>}
                </div>
              ))}
            </div>

            {/* Why it works */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Why This Works</p>
                <p className="text-sm leading-relaxed">{result.why_it_works}</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Key Styling Tip
                </p>
                <p className="text-sm leading-relaxed">{result.key_tip}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={generateQuick}>
              <Sparkles className="w-4 h-4 mr-2" />
              Try a Different Combination
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}