import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function StylePreferences({ preferences, onChange }) {
  const update = (key, value) => onChange({ ...preferences, [key]: value });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm mb-1.5 block">Mood / Vibe</Label>
          <Select value={preferences.mood || ""} onValueChange={(v) => update("mood", v)}>
            <SelectTrigger><SelectValue placeholder="How do you want to feel?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="confident">Confident & Powerful</SelectItem>
              <SelectItem value="relaxed">Relaxed & Effortless</SelectItem>
              <SelectItem value="elegant">Elegant & Refined</SelectItem>
              <SelectItem value="edgy">Edgy & Bold</SelectItem>
              <SelectItem value="playful">Playful & Fun</SelectItem>
              <SelectItem value="minimalist">Minimalist & Clean</SelectItem>
              <SelectItem value="romantic">Romantic & Soft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block">Weather</Label>
          <Select value={preferences.weather || ""} onValueChange={(v) => update("weather", v)}>
            <SelectTrigger><SelectValue placeholder="What's the weather?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Hot & Sunny</SelectItem>
              <SelectItem value="warm">Warm & Pleasant</SelectItem>
              <SelectItem value="cool">Cool & Breezy</SelectItem>
              <SelectItem value="cold">Cold & Chilly</SelectItem>
              <SelectItem value="rainy">Rainy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-1.5 block">Comfort Priority</Label>
          <Select value={preferences.comfort || ""} onValueChange={(v) => update("comfort", v)}>
            <SelectTrigger><SelectValue placeholder="Comfort vs. style?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="comfort_first">Comfort First</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="style_first">Style First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-sm mb-1.5 block">Anything else?</Label>
        <Textarea
          placeholder="e.g. I want to wear my new red heels, I'll be walking a lot, prefer darker tones..."
          value={preferences.extra_notes || ""}
          onChange={(e) => update("extra_notes", e.target.value)}
          className="h-20"
        />
      </div>
    </div>
  );
}