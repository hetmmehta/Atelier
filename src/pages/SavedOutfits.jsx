import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, BookmarkCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedOutfits() {
  const queryClient = useQueryClient();

  const { data: outfits = [], isLoading: loadingOutfits } = useQuery({
    queryKey: ["savedOutfits"],
    queryFn: () => base44.entities.SavedOutfit.list("-created_date"),
  });

  const { data: items = [] } = useQuery({
    queryKey: ["clothing"],
    queryFn: () => base44.entities.ClothingItem.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedOutfit.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedOutfits"] }),
  });

  const getItemsForOutfit = (outfit) =>
    (outfit.clothing_item_ids || [])
      .map((id) => items.find((i) => i.id === id))
      .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Saved Outfits
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your curated outfit collection
        </p>
      </div>

      {loadingOutfits ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <BookmarkCheck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No saved outfits yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Go to "Style Me" to generate outfit suggestions and save your favorites.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {outfits.map((outfit) => {
            const outfitItems = getItemsForOutfit(outfit);
            return (
              <Card key={outfit.id} className="p-5 md:p-6 group">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Item images */}
                  <div className="flex gap-2 overflow-x-auto flex-shrink-0">
                    {outfitItems.map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-20 md:w-24">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] font-medium mt-1 truncate">{item.name}</p>
                      </div>
                    ))}
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{outfit.name}</h3>
                        {outfit.occasion && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {outfit.occasion.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => deleteMutation.mutate(outfit.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    {outfit.styling_notes && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line line-clamp-4">
                        {outfit.styling_notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}