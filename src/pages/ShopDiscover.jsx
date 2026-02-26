import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Loader2, ExternalLink, Sparkles, Tag, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BUDGET_LABELS = {
  budget: "Under $50",
  mid_range: "$50–$200",
  premium: "$200–$500",
  luxury: "$500+",
};

export default function ShopDiscover() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [customBudget, setCustomBudget] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [saleOnly, setSaleOnly] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["styleProfile"],
    queryFn: () => base44.entities.StyleProfile.list(),
  });

  const profile = profiles[0] || {};
  const brands = selectedBrands.length > 0 ? selectedBrands : (profile.favorite_brands || []);

  const discover = async () => {
    setGenerating(true);
    setResults(null);

    const budget = customBudget || BUDGET_LABELS[profile.budget_range] || "any budget";
    const brandList = brands.length > 0 ? brands.join(", ") : "popular fashion brands";

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a personal shopping assistant. Based on the user's style profile, find real, current outfit recommendations and shopping links.

USER PROFILE:
- Favorite Brands: ${brandList}
- Budget: ${budget}
- Style Preferences: ${(profile.preferred_styles || []).join(", ") || "classic, modern"}
- Color Preferences: ${(profile.color_preferences || []).join(", ") || "neutrals"}
- Skin Tone: ${profile.skin_tone || "not specified"}
- Body Type: ${profile.body_type || "not specified"}
- Gender Expression: ${profile.gender_expression || "feminine"}
- Sale/Deals Only: ${saleOnly ? "YES - only include items on sale or with discount" : "no preference"}

Generate 6 specific outfit or clothing item recommendations from these brands. For each:
1. Give the item name, brand, approximate price within budget, and a direct shopping URL (use real brand websites like zara.com, hm.com, etc.)
2. Explain why it suits their style profile and skin tone
3. Note if it's on sale or a good deal

Make URLs realistic and plausible (e.g., https://www.zara.com/us/en/search?searchTerm=blazer). Focus on what's currently trending at these brands.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                item_name: { type: "string" },
                brand: { type: "string" },
                price: { type: "string" },
                original_price: { type: "string" },
                is_sale: { type: "boolean" },
                url: { type: "string" },
                why_for_you: { type: "string" },
                category: { type: "string" },
                color: { type: "string" },
              },
            },
          },
          trend_note: { type: "string" },
        },
      },
    });

    setResults(res);
    setGenerating(false);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const allBrands = profile.favorite_brands || [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Shop & Discover</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Find new pieces from your favorite brands — curated to your style, budget, and skin tone.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6 space-y-5">
        <h2 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Customize Your Search</h2>

        {allBrands.length > 0 && (
          <div>
            <Label className="text-sm mb-2 block font-medium">Brands (from your profile)</Label>
            <div className="flex flex-wrap gap-2">
              {allBrands.map((brand) => (
                <Badge
                  key={brand}
                  variant={selectedBrands.length === 0 || selectedBrands.includes(brand) ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1.5 px-3 transition-all"
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
            {selectedBrands.length > 0 && (
              <button className="text-xs text-muted-foreground mt-2 hover:text-foreground" onClick={() => setSelectedBrands([])}>
                Clear selection (show all)
              </button>
            )}
          </div>
        )}

        {allBrands.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add favorite brands in your <strong>Style Profile</strong> to get personalized shopping suggestions.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm mb-1.5 block">Budget Override</Label>
            <Select value={customBudget} onValueChange={setCustomBudget}>
              <SelectTrigger>
                <SelectValue placeholder={`Profile: ${BUDGET_LABELS[profile.budget_range] || "Not set"}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Use profile budget</SelectItem>
                <SelectItem value="Under $30">Under $30</SelectItem>
                <SelectItem value="$30–$100">$30–$100</SelectItem>
                <SelectItem value="$100–$300">$100–$300</SelectItem>
                <SelectItem value="$300–$600">$300–$600</SelectItem>
                <SelectItem value="$600+">$600+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${saleOnly ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"}`}
              onClick={() => setSaleOnly(!saleOnly)}
            >
              <Tag className="w-4 h-4" />
              {saleOnly ? "Sales Only ✓" : "Show Sales First"}
            </button>
          </div>
        </div>

        <Button onClick={discover} disabled={generating} className="w-full gap-2">
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Finding deals for you...</>
          ) : (
            <><Sparkles className="w-4 h-4" />Discover Outfits & Deals</>
          )}
        </Button>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-5">
          {results.trend_note && (
            <div className="p-4 rounded-xl bg-accent/50 border border-accent">
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Trend Insight
              </p>
              <p className="text-sm leading-relaxed">{results.trend_note}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium">Curated for You</h2>
            <Button variant="ghost" size="sm" onClick={discover} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(results.recommendations || []).map((item, i) => (
              <Card key={i} className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.item_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                  </div>
                  {item.is_sale && (
                    <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 border flex-shrink-0">
                      SALE
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{item.price}</span>
                  {item.original_price && item.original_price !== item.price && (
                    <span className="text-xs text-muted-foreground line-through">{item.original_price}</span>
                  )}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {item.category && <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>}
                  {item.color && <Badge variant="outline" className="text-[10px]">{item.color}</Badge>}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.why_for_you}</p>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Shop Now at {item.brand}
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}