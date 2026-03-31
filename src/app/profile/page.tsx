import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <ProfileClient profile={null} isAuthenticated={false} />;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return <ProfileClient profile={profile} isAuthenticated={true} />;
}
