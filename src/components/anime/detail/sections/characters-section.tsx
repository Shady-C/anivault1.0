"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/content/empty-state";

interface Character {
  character?: {
    mal_id?: number;
    name?: string;
    images?: { webp?: { image_url?: string }; jpg?: { image_url?: string } };
  };
  role?: string;
  voice_actors?: Array<{
    language?: string;
    person?: { mal_id?: number; name?: string; images?: { jpg?: { image_url?: string } } };
  }>;
}

interface CharactersSectionProps {
  characters?: Character[] | null;
}

export function CharactersSection({ characters }: CharactersSectionProps) {
  const [visible, setVisible] = useState(8);

  if (!characters || characters.length === 0) {
    return <EmptyState message="No characters information available." />;
  }

  const displayed = characters.slice(0, visible);
  const hasMore = visible < characters.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {displayed.map((char, i) => {
          const japVA = char.voice_actors?.find(va => va.language === "Japanese");
          const imgSrc = char.character?.images?.webp?.image_url || char.character?.images?.jpg?.image_url;

          return (
            <div
              key={`${char.character?.mal_id}-${i}`}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/6"
            >
              {imgSrc && (
                <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden relative">
                  <Image src={imgSrc} alt={char.character?.name || "Character"} fill sizes="40px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] truncate">{char.character?.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{char.role}</p>
                {japVA?.person?.name && (
                  <p className="text-[10px] text-[var(--text-dim)] truncate">{japVA.person.name}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => setVisible(v => v + 6)}
        >
          <ChevronDown size={14} className="mr-1" />
          Show More ({characters.length - visible} left)
        </Button>
      )}
    </>
  );
}
