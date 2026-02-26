import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const categoryEmojis = {
  tops: "👕",
  bottoms: "👖",
  dresses: "👗",
  outerwear: "🧥",
  shoes: "👟",
  accessories: "💍",
  bags: "👜",
  activewear: "🏃",
};

export default function ClothingCard({ item, onDelete, selectable, selected, onSelect }) {
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
        selected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={() => selectable && onSelect?.(item)}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3 space-y-1.5">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {categoryEmojis[item.category] || "👔"} {item.category}
          </Badge>
          {item.color && (
            <Badge variant="outline" className="text-xs font-normal">
              {item.color}
            </Badge>
          )}
        </div>
      </div>
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
      {selected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-xs">✓</span>
        </div>
      )}
    </Card>
  );
}