import { JikanClient } from "@rushelasli/jikants";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let jikanInstance: JikanClient | null = null;

export function getJikanClient(): JikanClient {
  if (!jikanInstance) {
    jikanInstance = new JikanClient({
      cacheOptions: { ttl: CACHE_TTL },
      enableLogging: process.env.NODE_ENV === "development",
    });
  }
  return jikanInstance;
}

export const jikan = getJikanClient();

export const {
  anime: animeClient,
  seasons: seasonsClient,
  schedules: schedulesClient,
} = jikan;
