"use client";

import { PageContainer } from "@/components";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { toast } from "react-toastify";
import cn from "classnames";
import {
  addPlayerToGroup,
  checkPlayerExistInGroup,
  getGroupPlayers,
  getPlayers,
  removePlayerFromGroup,
} from "@/lib/player-service";

export default function Page() {
  const { id: groupId } = useParams();
  const client = createClient();
  const [players, setPlayers] = useState<any[]>([]);
  const [addedPlayers, setAddedPlayers] = useState<number[]>([]);

  useEffect(() => {
    load();
    client
      .channel("players")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "players" },
        handlePlayerAdded
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "players" },
        handlePlayerDeleted
      )
      .subscribe();
  }, []);

  function handlePlayerAdded(payload: any) {
    load();
  }

  function handlePlayerDeleted(payload: any) {
    load();
  }

  async function load() {
    const players = await getPlayers();
    if (players) {
      setPlayers(players!);
    }
    const groupPlayers = await getGroupPlayers(+groupId);
    setAddedPlayers(groupPlayers!.map((gp) => gp.player_id));
  }

  async function addOrRemovePlayer(player: any) {
    const existing = await checkPlayerExistInGroup(+groupId, player.id);
    if (!!existing) {
      removePlayerFromGroup(+groupId, player.id);
      toast.error(`${player.name} removed`);
      setAddedPlayers(addedPlayers.filter((p) => p !== player.id));
    } else {
      addPlayerToGroup(+groupId, player.id);
      toast.success(`${player.name} added`);
      setAddedPlayers([...addedPlayers, player.id]);
    }
  }

  return (
    <PageContainer>
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
    </PageContainer>
  );
}
