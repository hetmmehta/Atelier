import React from "react";
import { Card } from "@/components/ui/card";

const occasions = [
  { value: "everyday_casual", label: "Everyday Casual", emoji: "☀️", desc: "Running errands, coffee dates" },
  { value: "work_office", label: "Work / Office", emoji: "💼", desc: "Professional & polished" },
  { value: "date_night", label: "Date Night", emoji: "🌙", desc: "Romantic & chic" },
  { value: "party", label: "Party / Night Out", emoji: "🎉", desc: "Fun & bold" },
  { value: "formal_event", label: "Formal Event", emoji: "✨", desc: "Galas, weddings, black tie" },
  { value: "brunch", label: "Brunch", emoji: "🥂", desc: "Relaxed & stylish" },
  { value: "travel", label: "Travel", emoji: "✈️", desc: "Comfortable & versatile" },
  { value: "workout", label: "Workout / Active", emoji: "🏋️", desc: "Sporty & functional" },
  { value: "interview", label: "Job Interview", emoji: "🤝", desc: "Confident & sharp" },
  { value: "beach", label: "Beach / Pool", emoji: "🏖️", desc: "Breezy & relaxed" },
];

export default function OccasionSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {occasions.map((occ) => (
        <Card
          key={occ.value}
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md text-center ${
            selected === occ.value
              ? "ring-2 ring-primary bg-primary/5 shadow-md"
              : "hover:bg-muted/50"
          }`}
          onClick={() => onSelect(occ.value)}
        >
          <span className="text-2xl block mb-2">{occ.emoji}</span>
          <p className="font-medium text-xs">{occ.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{occ.desc}</p>
        </Card>
      ))}
    </div>
  );
}