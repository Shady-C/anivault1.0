import { EmptyState } from "@/components/content/empty-state";
import { getYouTubeEmbedUrl } from "@/lib/utils/youtube";

interface TrailerSectionProps {
  trailersData?: {
    embed_url?: string | null;
    youtube_id?: string | null;
  } | null;
}

export function TrailerSection({ trailersData }: TrailerSectionProps) {
  const embedUrl = trailersData?.embed_url
    ? getYouTubeEmbedUrl(trailersData.embed_url, { noCookie: true })
    : trailersData?.youtube_id
    ? getYouTubeEmbedUrl(trailersData.youtube_id, { noCookie: true })
    : null;

  if (!embedUrl) {
    return <EmptyState message="No trailer available." className="py-4" />;
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xl">
      <iframe
        src={embedUrl}
        title="Anime Trailer"
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
