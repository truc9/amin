import { addPlayerIfNotExists } from "@/lib/player-service";
import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Page() {
  const client = createClient();
  const user = await currentUser();
  const { data: playerId } = await client
    .from("players")
    .select("id")
    .eq("clerk_id", user?.id)
    .maybeSingle();

  if (playerId) {
    redirect("/group");
  }

  await setupPlayer();

  async function setupPlayer() {
    await addPlayerIfNotExists(
      user!.id!,
      `${user!.firstName!} ${user!.lastName!}`
    );
    redirect("/group");
  }

  return <Suspense fallback={<span>Setup player...</span>}></Suspense>;
}
