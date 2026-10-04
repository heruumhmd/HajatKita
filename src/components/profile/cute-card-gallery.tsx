"use client";

import React, { useState, useMemo } from "react";
import { CUTE_CARDS } from "@/lib/cute-cards";
import { CuteCardItem } from "./cute-card-badge";
import { Sparkles, Search } from "lucide-react";

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
  const [search, setSearch] = useState("");

  const filteredCards = useMemo(() => {
    return CUTE_CARDS.filter((card) => {
      const matchGender =
        filter === "ALL" ? true : card.gender === filter || card.gender === "BOTH";
      const matchSearch =
        search.trim() === "" ||
        card.name.toLowerCase().includes(search.toLowerCase()) ||
        card.personality.toLowerCase().includes(search.toLowerCase()) ||
        card.roleLabel.toLowerCase().includes(search.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [filter, search]);

  return (
    <div className="space-y-3">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Gender Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === "ALL" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua ({CUTE_CARDS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("GROOM")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === "GROOM" ? "bg-white text-sky-700 shadow-2xs" : "text-slate-500 hover:text-sky-700"
            }`}
          >
            Pria
          </button>
          <button
            type="button"
            onClick={() => setFilter("BRIDE")}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === "BRIDE" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-500 hover:text-rose-700"
            }`}
          >
            Wanita
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-0 sm:w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari maskot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-medium pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pastel-300"
          />
        </div>
      </div>

      {/* Grid Cards Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] sm:max-h-[380px] overflow-y-auto p-1 pr-1.5 border border-slate-100 rounded-2xl scrollbar-thin">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Tidak ditemukan karakter dengan kata kunci &quot;{search}&quot;.
          </div>
        ) : (
          filteredCards.map((card) => (
            <CuteCardItem
              key={card.id}
              card={card}
              isSelected={selectedCardId === card.id}
              onSelect={() => onSelectCard(card.id)}
              size="sm"
            />
          ))
        )}
      </div>
    </div>
  );
}
