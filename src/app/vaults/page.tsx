import { createClient } from "@/lib/supabase/server";
import { getUserVaults } from "@/lib/supabase/queries/vaults";
import { VaultsClient } from "./vaults-client";

export default async function VaultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <VaultsClient vaults={[]} isAuthenticated={false} />;
  }

  const vaults = await getUserVaults();

  return <VaultsClient vaults={vaults} isAuthenticated={true} />;
}
