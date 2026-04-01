import { createClient } from "@/lib/supabase/server";
import { parseFile } from "@/lib/pipeline/parser";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rawText } = await request.json();
  if (typeof rawText !== "string") {
    return Response.json({ error: "rawText must be a string" }, { status: 400 });
  }

  const entries = await parseFile(rawText);
  return Response.json({ entries });
}
