import type { CSSProperties } from "react";

interface GenreGradient {
  from: string;
  to: string;
  emoji: string;
}

const GENRE_GRADIENT_MAP: Record<string, GenreGradient> = {
  Romance: { from: "#831843", to: "#3B0764", emoji: "💕" },
  Action: { from: "#7f1d1d", to: "#1E1B4B", emoji: "⚔️" },
  Comedy: { from: "#713f12", to: "#1E1B4B", emoji: "😂" },
  Fantasy: { from: "#14532d", to: "#1E1B4B", emoji: "🧙" },
  "Sci-Fi": { from: "#0c4a6e", to: "#1E1B4B", emoji: "🚀" },
  Horror: { from: "#450a0a", to: "#0a0a0a", emoji: "💀" },
  Drama: { from: "#312e81", to: "#1E1B4B", emoji: "🎭" },
  Psychological: { from: "#4a044e", to: "#0a0a0a", emoji: "🧠" },
  "Slice of Life": { from: "#365314", to: "#1E1B4B", emoji: "🌸" },
  Sports: { from: "#78350f", to: "#1E1B4B", emoji: "🏆" },
  Isekai: { from: "#1e3a5f", to: "#1E1B4B", emoji: "🌀" },
  Mystery: { from: "#1c1917", to: "#0a0a0a", emoji: "🔍" },
  Thriller: { from: "#1c1917", to: "#1E1B4B", emoji: "😰" },
  Mecha: { from: "#134e4a", to: "#1E1B4B", emoji: "🤖" },
  Supernatural: { from: "#2e1065", to: "#0a0a0a", emoji: "👻" },
  Historical: { from: "#422006", to: "#1E1B4B", emoji: "⚔️" },
  Music: { from: "#4a044e", to: "#3B0764", emoji: "🎵" },
  Donghua: { from: "#450a0a", to: "#3B0764", emoji: "🐉" },
};

const DEFAULT_GRADIENT: GenreGradient = { from: "#1a1a2e", to: "#0a0a0a", emoji: "🎌" };

export function getGenreGradient(genres: string[] | null | undefined): GenreGradient {
  if (!genres || genres.length === 0) return DEFAULT_GRADIENT;
  for (const genre of genres) {
    const gradient = GENRE_GRADIENT_MAP[genre];
    if (gradient) return gradient;
  }
  return DEFAULT_GRADIENT;
}

export function getGenreGradientStyle(genres: string[] | null | undefined): CSSProperties {
  const { from, to } = getGenreGradient(genres);
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}
