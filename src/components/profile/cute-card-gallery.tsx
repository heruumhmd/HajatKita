"use client";

import React, { useState } from "react";
import { CUTE_CARDS, CuteCard } from "@/lib/cute-cards";
import { CuteCardItem } from "./cute-card-badge";
import { Sparkles, Heart } from "lucide-react";

interface CuteCardGalleryProps {
  selectedCardId?: string;
  onSelectCard: (cardId: string) => void;
  userRole?: "GROOM" | "BRIDE" | "COLLABORATOR";
}

export function CuteCardGallery({
  selectedCardId,
  onSelectCard,
  userRole,
}: CuteCardGalleryProps) {
  const [filter, setFilter] = useState<"ALL" | "GROOM" | "BRIDE">(
    userRole === "BRIDE" ? "BRIDE" : userRole === "GROOM" ? "GROOM" : "ALL"
  );

  const filteredCards = CUTE_CARDS.filter((card) => {
    if (filter === "ALL") return true;
    return card.gender === filter || card.gender === "BOTH";
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800">
            Pilih Kartu Avatar Lucu Pasangan:
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              filter === "ALL" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter("GROOM")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              filter === "GROOM" ? "bg-white text-sky-700 shadow-2xs" : "text-slate-500"
            }`}
          >
            Pria
          </button>
          <button
            type="button"
            onClick={() => setFilter("BRIDE")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              filter === "BRIDE" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500"
            }`}
          >
            Wanita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1 border border-slate-100 rounded-2xl">
        {filteredCards.map((card) => (
          <CuteCardItem
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onSelect={() => onSelectCard(card.id)}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}
