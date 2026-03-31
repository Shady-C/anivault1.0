import { NextResponse } from "next/server";
import { getSchedules } from "@/lib/api/anime";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "other"];

export async function GET() {
  const results = await Promise.allSettled(
    DAYS.map(day => getSchedules(1, { filter: day, limit: 25 }))
  );

  const byDay: Record<string, unknown[]> = {};
  DAYS.forEach((day, i) => {
    const result = results[i];
    byDay[day] = result.status === "fulfilled" ? result.value.data : [];
  });

  return NextResponse.json({ byDay });
}
