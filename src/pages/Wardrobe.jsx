import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClothingCard from "@/components/wardrobe/ClothingCard";
import AddClothingDialog from "@/components/wardrobe/AddClothingDialog";
import CategoryFilter from "@/components/wardrobe/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wardrobe() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["clothing"],
    queryFn: () => base44.entities.ClothingItem.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClothingItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clothing"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClothingItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clothing"] }),
  });

  const filtered = activeCategory === "all"
    ? items
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            My Wardrobe
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {items.length} piece{items.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {/* Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Shirt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No items yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Start building your digital wardrobe by adding your first clothing item.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-4 gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddClothingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={(data) => createMutation.mutateAsync(data)}
      />
    </div>
  );
}