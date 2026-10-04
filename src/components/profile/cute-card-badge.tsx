"use client";

import React from "react";
import { CuteCard, getCuteCard } from "@/lib/cute-cards";
import { Sparkles, Heart, Check } from "lucide-react";

interface CuteCardItemProps {
  card: CuteCard;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: "sm" | "md" | "lg";
}

export function CuteCardItem({
  card,
  isSelected = false,
  onSelect,
  size = "md",
}: CuteCardItemProps) {
  const isSm = size === "sm";

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 select-none overflow-hidden ${
        card.theme.bgGradient
      } bg-gradient-to-br p-3 sm:p-4 flex flex-col justify-between ${
        isSelected
          ? `${card.theme.border} ring-2 ring-pastel-400 shadow-md scale-[1.02]`
          : "border-slate-200/80 hover:border-slate-300 hover:shadow-xs hover:scale-[1.01]"
      } ${isSm ? "min-h-[140px]" : "min-h-[160px] sm:min-h-[180px]"}`}
    >
      {/* Selection Check Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pastel-600 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {/* Top Tag & Mascot Emoji */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs ${card.theme.badgeBg} ${card.theme.badgeText}`}
          >
            {card.roleLabel}
          </span>
          <span className="text-xl sm:text-2xl filter drop-shadow-xs">{card.emoji}</span>
        </div>

        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm font-serif leading-tight mt-1">
          {card.name}
        </h4>
        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-1">
          ✨ {card.personality}
        </p>
      </div>

      {/* Bottom Quote Bubble */}
      <div className="mt-2 pt-2 border-t border-slate-200/60">
        <p className="text-[10px] italic text-slate-600 leading-snug line-clamp-2">
          &quot;{card.quote}&quot;
        </p>
      </div>
    </div>
  );
}

// Compact Avatar Badge for Top Navbar & Sidebar
export function CuteAvatarBadge({
  cardId,
  name,
  size = "md",
}: {
  cardId?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const card = getCuteCard(cardId);

  if (size === "xs") {
    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${card.theme.border} ${card.theme.bgGradient} bg-gradient-to-br shadow-2xs shrink-0`}
        title={`${card.name} (${card.roleLabel})`}
      >
        <span>{card.emoji.slice(0, 2)}</span>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-sm border-2 ${card.theme.border} ${card.theme.bgGradient} bg-gradient-to-br shadow-2xs shrink-0`}
        title={`${card.name} (${card.roleLabel})`}
      >
        <span>{card.emoji.slice(0, 2)}</span>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-2xl border-2 ${card.theme.border} ${card.theme.bgGradient} bg-gradient-to-br shadow-sm shrink-0 relative`}
      >
        <span>{card.emoji.slice(0, 2)}</span>
        <span
          className={`absolute -bottom-1 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full ${card.theme.badgeBg} ${card.theme.badgeText} truncate max-w-[90%]`}
        >
          {card.name.split(" ")[0]}
        </span>
      </div>
    );
  }

  // Medium (Default)
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border ${card.theme.border} ${card.theme.bgGradient} bg-gradient-to-br shadow-2xs`}
    >
      <span className="text-base">{card.emoji.slice(0, 2)}</span>
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-extrabold text-slate-800 leading-none">
          {name || card.name}
        </span>
        <span className="text-[8px] font-bold text-slate-500">{card.roleLabel}</span>
      </div>
    </div>
  );
}
