export interface CuteCard {
  id: string;
  name: string;
  roleLabel: string;
  gender: "GROOM" | "BRIDE" | "BOTH";
  personality: string;
  quote: string;
  emoji: string;
  theme: {
    bgGradient: string;
    border: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  };
}

export const CUTE_CARDS: CuteCard[] = [
  {
    id: "cat-prince",
    name: "Pangeran Miaw",
    roleLabel: "Calon Suami Penyayang",
    gender: "GROOM",
    personality: "Setia & Penuh Perhatian",
    quote: "Siap menjagamu dan membahagiakanmu setiap hari!",
    emoji: "🐱👑",
    theme: {
      bgGradient: "from-sky-50 via-blue-50 to-indigo-50",
      border: "border-sky-300",
      accent: "text-sky-600",
      badgeBg: "bg-sky-500",
      badgeText: "text-white",
      glow: "shadow-sky-100",
    },
  },
  {
    id: "cat-princess",
    name: "Permaisuri Luna",
    roleLabel: "Calon Istri Anggun",
    gender: "BRIDE",
    personality: "Ceria & Lemah Lembut",
    quote: "Biar hajatan kita makin manis, terarah & berkah!",
    emoji: "🐱🌸",
    theme: {
      bgGradient: "from-pink-50 via-rose-50 to-amber-50",
      border: "border-rose-300",
      accent: "text-rose-600",
      badgeBg: "bg-rose-500",
      badgeText: "text-white",
      glow: "shadow-rose-100",
    },
  },
  {
    id: "bear-groom",
    name: "Ksatria Teddy",
    roleLabel: "Calon Suami Pengayom",
    gender: "GROOM",
    personality: "Tangguh & Pelindung Keluarga",
    quote: "Bersamamu, rumah tangga kita kokoh dan penuh ketenangan.",
    emoji: "🐻🛡️",
    theme: {
      bgGradient: "from-amber-50 via-orange-50 to-amber-100",
      border: "border-amber-300",
      accent: "text-amber-700",
      badgeBg: "bg-amber-600",
      badgeText: "text-white",
      glow: "shadow-amber-100",
    },
  },
  {
    id: "bunny-bride",
    name: "Kelinci Mochi",
    roleLabel: "Calon Istri Gemoy",
    gender: "BRIDE",
    personality: "Kreatif & Bersemangat",
    quote: "Semua detail pernikahan kita siapkan dengan cinta!",
    emoji: "🐰🎀",
    theme: {
      bgGradient: "from-fuchsia-50 via-pink-50 to-purple-50",
      border: "border-pink-300",
      accent: "text-fuchsia-600",
      badgeBg: "bg-fuchsia-500",
      badgeText: "text-white",
      glow: "shadow-pink-100",
    },
  },
  {
    id: "penguin-groom",
    name: "Pinguin Romeo",
    roleLabel: "Calon Suami Romantis",
    gender: "GROOM",
    personality: "Setia Seumur Hidup",
    quote: "Seperti pinguin, aku memilihmu untuk selamanya.",
    emoji: "🐧💍",
    theme: {
      bgGradient: "from-cyan-50 via-teal-50 to-blue-50",
      border: "border-cyan-300",
      accent: "text-cyan-700",
      badgeBg: "bg-cyan-600",
      badgeText: "text-white",
      glow: "shadow-cyan-100",
    },
  },
  {
    id: "deer-bride",
    name: "Rusa Bella",
    roleLabel: "Calon Istri Anggun",
    gender: "BRIDE",
    personality: "Bijaksana & Tenang",
    quote: "Membangun surga kecil di rumah kita bersama.",
    emoji: "🦌✨",
    theme: {
      bgGradient: "from-emerald-50 via-teal-50 to-lime-50",
      border: "border-emerald-300",
      accent: "text-emerald-700",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      glow: "shadow-emerald-100",
    },
  },
  {
    id: "fox-groom",
    name: "Rubah Koko",
    roleLabel: "Calon Suami Cerdas",
    gender: "GROOM",
    personality: "Perencana Finansial Handal",
    quote: "Target tabungan aman, masa depan kita terencana rapi!",
    emoji: "🦊💼",
    theme: {
      bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
      border: "border-orange-300",
      accent: "text-orange-700",
      badgeBg: "bg-orange-500",
      badgeText: "text-white",
      glow: "shadow-orange-100",
    },
  },
  {
    id: "duck-bride",
    name: "Bebek Cici",
    roleLabel: "Calon Istri Ceria",
    gender: "BRIDE",
    personality: "Ramah & Hangat",
    quote: "Menyambut hari bahagia dengan senyuman paling manis!",
    emoji: "🐥🌼",
    theme: {
      bgGradient: "from-yellow-50 via-amber-50 to-orange-50",
      border: "border-yellow-300",
      accent: "text-yellow-700",
      badgeBg: "bg-amber-500",
      badgeText: "text-white",
      glow: "shadow-yellow-100",
    },
  },
  {
    id: "panda-groom",
    name: "Panda Boba",
    roleLabel: "Calon Suami Kalem",
    gender: "GROOM",
    personality: "Sabar & Menyenangkan",
    quote: "Santai tapi pasti, hajatan kita beres tanpa pusing!",
    emoji: "🐼🎋",
    theme: {
      bgGradient: "from-slate-50 via-zinc-50 to-teal-50",
      border: "border-slate-300",
      accent: "text-slate-700",
      badgeBg: "bg-slate-700",
      badgeText: "text-white",
      glow: "shadow-slate-100",
    },
  },
  {
    id: "hedgehog-bride",
    name: "Landak Pipit",
    roleLabel: "Calon Istri Teliti",
    gender: "BRIDE",
    personality: "Detail & Peduli Sesama",
    quote: "Checklist rapi, akad khidmat, resepsi berkesan!",
    emoji: "🦔🌷",
    theme: {
      bgGradient: "from-violet-50 via-purple-50 to-pink-50",
      border: "border-violet-300",
      accent: "text-violet-700",
      badgeBg: "bg-violet-600",
      badgeText: "text-white",
      glow: "shadow-violet-100",
    },
  },
];

export function getCuteCard(id?: string): CuteCard {
  const found = CUTE_CARDS.find((c) => c.id === id);
  return found || CUTE_CARDS[0];
}

export function getDefaultCuteCardForRole(role?: "GROOM" | "BRIDE" | "COLLABORATOR"): CuteCard {
  if (role === "BRIDE") return CUTE_CARDS[1]; // Permaisuri Luna
  return CUTE_CARDS[0]; // Pangeran Miaw
}
