import React from "react";
import { Button } from "@/components/ui/button";

const categories = [
  { value: "all", label: "All", emoji: "✨" },
  { value: "tops", label: "Tops", emoji: "👕" },
  { value: "bottoms", label: "Bottoms", emoji: "👖" },
  { value: "dresses", label: "Dresses", emoji: "👗" },
  { value: "outerwear", label: "Outerwear", emoji: "🧥" },
  { value: "shoes", label: "Shoes", emoji: "👟" },
  { value: "accessories", label: "Accessories", emoji: "💍" },
  { value: "bags", label: "Bags", emoji: "👜" },
  { value: "activewear", label: "Active", emoji: "🏃" },
];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <Button
          key={cat.value}
          variant={active === cat.value ? "default" : "outline"}
          size="sm"
          className="flex-shrink-0 gap-1.5 text-xs rounded-full"
          onClick={() => onChange(cat.value)}
        >
          <span>{cat.emoji}</span>
          {cat.label}
        </Button>
      ))}
    </div>
  );
}