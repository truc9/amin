"use client";

import { PageContainer, LoadingSkeleton } from "@/components";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import cn from "classnames";

export default function Page() {
  const { id: groupId } = useParams();
  const supabase = createClient();
  const players = use(getPlayers());
  const groupPlayers = use(getGroupPlayers());
  const [addedPlayers, setAddedPlayers] = useState<number[]>(
    groupPlayers!.map((gp) => gp.player_id)
  );

  //TODO: left join rather than 2 queries?
  async function getPlayers() {
    const { data } = await supabase.from("players").select();
    return data;
  }

  async function getGroupPlayers() {
    const { data } = await supabase
      .from("player_groups")
      .select()
      .eq("group_id", groupId);
    return data;
  }

  async function addOrRemovePlayer(player: any) {
    const existing = await supabase
      .from("player_groups")
      .select("id")
      .match({
        player_id: player.id,
        group_id: groupId,
      })
      .maybeSingle();

    if (!!existing.data) {
      await supabase.from("player_groups").delete().match({
        player_id: player.id,
        group_id: groupId,
      });
      await supabase
        .from("player_registrations")
        .delete()
        .eq("player_id", player.id);
      toast.error(`${player.name} removed`);
      setAddedPlayers(addedPlayers.filter((p) => p !== player.id));
    } else {
      await supabase
        .from("player_groups")
        .insert({
          player_id: player.id,
          group_id: groupId,
        })
        .select()
        .maybeSingle();
      toast.success(`${player.name} added`);
      setAddedPlayers([...addedPlayers, player.id]);
    }
  }

  return (
    <PageContainer>
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="flex flex-col gap-3">
          {players?.map((p) => {
            const added = addedPlayers?.includes(p.id);
            return (
              <button
                onClick={() => addOrRemovePlayer(p)}
                key={p.id}
                className={cn(
                  "bg-slate-100 h-16 p-3 flex items-center justify-between rounded active:ring-2 ring-green-500 ring-offset-2",
                  {
                    "font-bold": added,
                    "text-slate-400": !added,
                  }
                )}
              >
                <div className="flex flex-col items-start">
                  <span>{p.name}</span>
                  <span className="text-xs">#{p.id}</span>
                </div>

                <div className="text-3xl">
                  {added ? (
                    <IoCheckmarkCircle className="text-green-500" />
                  ) : (
                    <IoCheckmarkCircle className="text-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Suspense>
    </PageContainer>
  );
}
