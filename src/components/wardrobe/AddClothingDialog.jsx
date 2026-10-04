import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const categories = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "dresses", label: "Dresses" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "bags", label: "Bags" },
  { value: "activewear", label: "Activewear" },
];

const seasons = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all_seasons", label: "All Seasons" },
];

const formalities = [
  { value: "casual", label: "Casual" },
  { value: "smart_casual", label: "Smart Casual" },
  { value: "business_casual", label: "Business Casual" },
  { value: "formal", label: "Formal" },
  { value: "black_tie", label: "Black Tie" },
];

const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "28", "30", "32", "34", "36", "38", "40", "6", "7", "8", "9", "10", "11", "12", "Custom"];
const fitNotes = ["Runs Small", "True to Size", "Runs Large", "Slim Fit", "Oversized", "Relaxed Fit"];

export default function AddClothingDialog({ open, onOpenChange, onAdd }) {
  const [form, setForm] = useState({
    name: "", category: "", color: "", subcategory: "",
    season: "", formality: "", brand: "", size: "", fit_notes: "", notes: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedUrl(null);
    }
  };

  // Upload the selected photo at most once; auto-detect and submit share the URL.
  const ensureUploaded = async () => {
    if (uploadedUrl) return uploadedUrl;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
    setUploadedUrl(file_url);
    return file_url;
  };

  const handleAutoDetect = async () => {
    if (!imageFile) return;
    setAutoDetecting(true);
    try {
      const file_url = await ensureUploaded();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Analyze this clothing item image. Identify: the name/type of the item, its category (tops, bottoms, dresses, outerwear, shoes, accessories, bags, activewear), its primary color, a subcategory (like t-shirt, blazer, jeans, sneakers), the best season to wear it, its formality level (casual, smart_casual, business_casual, formal, black_tie), and the brand if visible on the item/tag.",
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string", enum: ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags", "activewear"] },
            color: { type: "string" },
            subcategory: { type: "string" },
            season: { type: "string", enum: ["spring", "summer", "fall", "winter", "all_seasons"] },
            formality: { type: "string", enum: ["casual", "smart_casual", "business_casual", "formal", "black_tie"] },
            brand: { type: "string" },
          },
        },
      });
      setForm((prev) => ({
        ...prev,
        name: result.name || prev.name,
        category: result.category || prev.category,
        color: result.color || prev.color,
        subcategory: result.subcategory || prev.subcategory,
        season: result.season || prev.season,
        formality: result.formality || prev.formality,
        brand: result.brand || prev.brand,
      }));
    } catch (error) {
      console.error("Auto-detect failed", error);
      toast({
        variant: "destructive",
        title: "Auto-detect failed",
        description: "We couldn't analyze this photo. You can still fill in the details yourself.",
      });
    } finally {
      setAutoDetecting(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !form.name || !form.category) return;
    setUploading(true);
    try {
      const file_url = await ensureUploaded();
      await onAdd({ ...form, image_url: file_url });
      setForm({ name: "", category: "", color: "", subcategory: "", season: "", formality: "", brand: "", size: "", fit_notes: "", notes: "" });
      setImageFile(null);
      setImagePreview(null);
      setUploadedUrl(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Adding clothing item failed", error);
      toast({ variant: "destructive", title: "Couldn't add item", description: "Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add to Wardrobe</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Photo</Label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-xl" />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="gap-1.5 text-xs backdrop-blur-sm bg-background/80" onClick={handleAutoDetect} disabled={autoDetecting}>
                    {autoDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {autoDetecting ? "Detecting..." : "Auto-detect"}
                  </Button>
                  <label>
                    <Button size="sm" variant="secondary" className="text-xs backdrop-blur-sm bg-background/80" asChild><span>Change</span></Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload a photo</span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-sm mb-1.5 block">Name *</Label>
              <Input placeholder="e.g. Navy Blazer" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Brand</Label>
              <Input placeholder="e.g. Zara, H&M, Gucci" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Size</Label>
              <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}>
                <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Fit</Label>
              <Select value={form.fit_notes} onValueChange={(v) => setForm({ ...form, fit_notes: v })}>
                <SelectTrigger><SelectValue placeholder="How does it fit?" /></SelectTrigger>
                <SelectContent>
                  {fitNotes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Color</Label>
              <Input placeholder="e.g. Navy Blue" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Subcategory</Label>
              <Input placeholder="e.g. Blazer, T-shirt" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Season</Label>
              <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Formality</Label>
              <Select value={form.formality} onValueChange={(v) => setForm({ ...form, formality: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {formalities.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-sm mb-1.5 block">Notes</Label>
              <Textarea placeholder="Any additional notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-16" />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={uploading || !imageFile || !form.name || !form.category} className="w-full gap-2">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {uploading ? "Adding..." : "Add to Wardrobe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}