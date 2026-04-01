import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchAnime } from "@/lib/api/anime";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return Response.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  const result = await searchAnime(q, 1, 5);
  return Response.json(result);
}
