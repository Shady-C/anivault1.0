type ThumbnailQuality = "default" | "mq" | "hq" | "sd" | "maxres";

interface YouTubeEmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  loop?: boolean;
  enablejsapi?: boolean;
  noCookie?: boolean;
}

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const patterns = [
      /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([^?&]+)/,
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?&]+)/,
      /(?:youtube\.com\/v\/)([^?&]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(
  videoIdOrUrl: string | null | undefined,
  quality: ThumbnailQuality | string = "maxresdefault"
): string | null {
  if (!videoIdOrUrl) return null;

  const videoId =
    videoIdOrUrl.includes("youtube") || videoIdOrUrl.includes("youtu.be")
      ? extractYouTubeVideoId(videoIdOrUrl)
      : videoIdOrUrl;

  if (!videoId) return null;

  const qualityMap: Record<ThumbnailQuality, string> = {
    default: "default",
    mq: "mqdefault",
    hq: "hqdefault",
    sd: "sddefault",
    maxres: "maxresdefault",
  };

  const thumbnailQuality = qualityMap[quality as ThumbnailQuality] || quality;

  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
}

export function getYouTubeEmbedUrl(
  videoIdOrUrl: string | null | undefined,
  options: YouTubeEmbedOptions = {}
): string | null {
  if (!videoIdOrUrl) return null;

  const videoId =
    videoIdOrUrl.includes("youtube") || videoIdOrUrl.includes("youtu.be")
      ? extractYouTubeVideoId(videoIdOrUrl)
      : videoIdOrUrl;

  if (!videoId) return null;

  const { autoplay = false, mute = false, controls = true, loop = false, enablejsapi = false, noCookie = true } = options;

  const domain = noCookie ? "youtube-nocookie.com" : "youtube.com";
  const url = new URL(`https://www.${domain}/embed/${videoId}`);

  if (autoplay) url.searchParams.set("autoplay", "1");
  if (mute) url.searchParams.set("mute", "1");
  if (!controls) url.searchParams.set("controls", "0");
  if (loop) {
    url.searchParams.set("loop", "1");
    url.searchParams.set("playlist", videoId);
  }
  if (enablejsapi) url.searchParams.set("enablejsapi", "1");

  return url.toString();
}
