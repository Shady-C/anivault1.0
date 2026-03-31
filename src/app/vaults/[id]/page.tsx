import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVaultDetail } from "@/lib/supabase/queries/vaults";
import { VaultDetailClient } from "./vault-detail-client";

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vaults");

  const vault = await getVaultDetail(id);
  if (!vault) notFound();

  return <VaultDetailClient vault={vault} currentUserId={user.id} />;
}
