import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, X, Plus, User, Camera, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const bodyTypes = [
  { value: "hourglass", label: "Hourglass", desc: "Balanced bust & hips, defined waist" },
  { value: "pear", label: "Pear", desc: "Hips wider than shoulders" },
  { value: "apple", label: "Apple", desc: "Fuller midsection" },
  { value: "rectangle", label: "Rectangle", desc: "Balanced proportions" },
  { value: "inverted_triangle", label: "Inverted Triangle", desc: "Shoulders wider than hips" },
  { value: "athletic", label: "Athletic", desc: "Toned & muscular build" },
];

const styleOptions = ["Classic", "Minimalist", "Bohemian", "Streetwear", "Preppy", "Romantic", "Edgy", "Sporty", "Glamorous", "Vintage"];
const colorOptions = ["Neutrals", "Earth Tones", "Pastels", "Jewel Tones", "Monochrome", "Bold & Bright", "Cool Blues", "Warm Reds", "All Black", "Metallics"];
const popularBrands = ["Zara", "H&M", "Mango", "Uniqlo", "Ralph Lauren", "Tommy Hilfiger", "Levi's", "Nike", "Adidas", "Gucci", "Louis Vuitton", "Prada", "Versace", "Balenciaga", "Off-White", "Stone Island", "ASOS", "Shein", "Reformation", "Free People"];

export default function StyleProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    body_type: "", height_cm: "", weight_kg: "", height: "",
    preferred_styles: [], color_preferences: [], avoid_colors: [],
    budget_range: "", climate: "", age_group: "", gender_expression: "",
    photo_url: "", skin_tone: "", favorite_brands: [],
  });
  const [newAvoidColor, setNewAvoidColor] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [existingId, setExistingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzingSkin, setAnalyzingSkin] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["styleProfile"],
    queryFn: () => base44.entities.StyleProfile.list(),
  });

  useEffect(() => {
    if (profiles.length > 0) {
      const p = profiles[0];
      setExistingId(p.id);
      setForm({
        body_type: p.body_type || "",
        height_cm: p.height_cm || "",
        weight_kg: p.weight_kg || "",
        height: p.height || "",
        preferred_styles: p.preferred_styles || [],
        color_preferences: p.color_preferences || [],
        avoid_colors: p.avoid_colors || [],
        budget_range: p.budget_range || "",
        climate: p.climate || "",
        age_group: p.age_group || "",
        gender_expression: p.gender_expression || "",
        photo_url: p.photo_url || "",
        skin_tone: p.skin_tone || "",
        favorite_brands: p.favorite_brands || [],
      });
      if (p.photo_url) setPhotoPreview(p.photo_url);
    }
  }, [profiles]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    // Auto analyze skin tone
    setAnalyzingSkin(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: "Analyze the skin tone of the person in this photo. Provide a clear, descriptive skin tone (e.g. 'warm golden brown', 'fair with pink undertones', 'deep ebony', 'medium olive', 'cool porcelain'). Also suggest which colors and tones would complement this skin tone best for clothing choices.",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          skin_tone: { type: "string" },
          complementary_colors: { type: "array", items: { type: "string" } },
        },
      },
    });
    setForm((prev) => ({
      ...prev,
      photo_url: file_url,
      skin_tone: result.skin_tone || prev.skin_tone,
    }));
    setAnalyzingSkin(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingId) return base44.entities.StyleProfile.update(existingId, form);
      return base44.entities.StyleProfile.create(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["styleProfile"] });
      toast.success("Style profile saved!");
    },
  });

  const toggleArray = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  };

  const addAvoidColor = () => {
    if (newAvoidColor.trim()) {
      setForm((prev) => ({ ...prev, avoid_colors: [...prev.avoid_colors, newAvoidColor.trim()] }));
      setNewAvoidColor("");
    }
  };

  const addBrand = (brand) => {
    const b = brand || newBrand.trim();
    if (b && !form.favorite_brands.includes(b)) {
      setForm((prev) => ({ ...prev, favorite_brands: [...prev.favorite_brands, b] }));
      setNewBrand("");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Style Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Help our AI understand your body, skin tone, and preferences for perfectly curated looks.
        </p>
      </div>

      <div className="space-y-8">
        {/* Photo & Skin Tone */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Your Photo & Skin Tone
          </h2>
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0">
              {photoPreview ? (
                <div className="relative w-32 h-40 rounded-xl overflow-hidden">
                  <img src={photoPreview} alt="You" className="w-full h-full object-cover" />
                  {analyzingSkin && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all">
                  <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground text-center">Upload photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
              {photoPreview && (
                <label className="mt-2 block">
                  <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                    <span>Change Photo</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload a selfie or photo so our AI can detect your skin tone and recommend colors that will make you look amazing.
              </p>
              {form.skin_tone && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Detected Skin Tone
                  </p>
                  <p className="text-sm font-medium capitalize">{form.skin_tone}</p>
                </div>
              )}
              {analyzingSkin && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing your skin tone...
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Body & Physical */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-medium mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Body & Measurements
          </h2>
          <div className="space-y-5">
            <div>
              <Label className="text-sm mb-3 block font-medium">Body Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bodyTypes.map((bt) => (
                  <div
                    key={bt.value}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${form.body_type === bt.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30"}`}
                    onClick={() => setForm({ ...form, body_type: bt.value })}
                  >
                    <p className="font-medium text-sm">{bt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{bt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 165"
                  value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 60"
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Gender Expression</Label>
                <Select value={form.gender_expression} onValueChange={(v) => setForm({ ...form, gender_expression: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminine">Feminine</SelectItem>
                    <SelectItem value="masculine">Masculine</SelectItem>
                    <SelectItem value="androgynous">Androgynous</SelectItem>
                    <SelectItem value="fluid">Fluid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Age Group</Label>
                <Select value={form.age_group} onValueChange={(v) => setForm({ ...form, age_group: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18–24</SelectItem>
                    <SelectItem value="25-34">25–34</SelectItem>
                    <SelectItem value="35-44">35–44</SelectItem>
                    <SelectItem value="45-54">45–54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Climate</Label>
                <Select value={form.climate} onValueChange={(v) => setForm({ ...form, climate: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tropical">Tropical</SelectItem>
                    <SelectItem value="temperate">Temperate</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="dry">Dry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Budget Range</Label>
                <Select value={form.budget_range} onValueChange={(v) => setForm({ ...form, budget_range: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget-Friendly</SelectItem>
                    <SelectItem value="mid_range">Mid-Range</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Style Preferences */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-medium mb-4">Style Preferences</h2>
          <div className="space-y-5">
            <div>
              <Label className="text-sm mb-3 block font-medium">Preferred Styles</Label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map((style) => (
                  <Badge
                    key={style}
                    variant={form.preferred_styles.includes(style) ? "default" : "outline"}
                    className="cursor-pointer text-xs py-1.5 px-3 transition-all"
                    onClick={() => toggleArray("preferred_styles", style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block font-medium">Color Palettes You Love</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <Badge
                    key={color}
                    variant={form.color_preferences.includes(color) ? "default" : "outline"}
                    className="cursor-pointer text-xs py-1.5 px-3 transition-all"
                    onClick={() => toggleArray("color_preferences", color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm mb-3 block font-medium">Colors to Avoid</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.avoid_colors.map((color) => (
                  <Badge key={color} variant="secondary" className="gap-1 text-xs">
                    {color}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setForm((prev) => ({ ...prev, avoid_colors: prev.avoid_colors.filter((c) => c !== color) }))} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="e.g. Neon Green" value={newAvoidColor} onChange={(e) => setNewAvoidColor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAvoidColor()} className="flex-1" />
                <Button variant="outline" size="icon" onClick={addAvoidColor}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Favorite Brands */}
        <Card className="p-6">
          <h2 className="font-display text-lg font-medium mb-4">Favorite Brands</h2>
          <p className="text-sm text-muted-foreground mb-4">Used for the Shopping tab to find sales and new arrivals.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {popularBrands.map((brand) => (
              <Badge
                key={brand}
                variant={form.favorite_brands.includes(brand) ? "default" : "outline"}
                className="cursor-pointer text-xs py-1.5 px-3 transition-all"
                onClick={() => toggleArray("favorite_brands", brand)}
              >
                {brand}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Input placeholder="Add another brand..." value={newBrand} onChange={(e) => setNewBrand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBrand()} className="flex-1" />
            <Button variant="outline" size="icon" onClick={() => addBrand()}><Plus className="w-4 h-4" /></Button>
          </div>
          {form.favorite_brands.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.favorite_brands.filter((b) => !popularBrands.includes(b)).map((brand) => (
                <Badge key={brand} variant="secondary" className="gap-1 text-xs">
                  {brand}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setForm((prev) => ({ ...prev, favorite_brands: prev.favorite_brands.filter((b) => b !== brand) }))} />
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saveMutation.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}