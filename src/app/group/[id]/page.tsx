"use client";

import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import cn from "classnames";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { LinkButton, Skeleton, PageContainer } from "@/components";
import { useParams } from "next/navigation";
import { IoAdd, IoPeople, IoPerson } from "react-icons/io5";

dayjs.extend(weekday);

export default function Page() {
  const client = createClient();
  const { id: groupId } = useParams();
  const [players, setPlayers] = useState<any[] | null>();
  const { userId } = useAuth();
  const { user } = useUser();
  const playerId = useMemo(() => {
    return players?.find((p) => p.clerk_id == userId)?.id;
  }, [players, userId]);

  const weekStart = dayjs().weekday(8);
  const weekEnd = weekStart.add(7);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((item) => {
    const d = weekStart.add(item, "day");
    return d;
  });
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    client
      .channel("reg")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "player_registrations" },
        handlePlayerRegistrations
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "player_registrations" },
        handlePlayerRegistrations
      )
      .subscribe();
  }, []);

  useEffect(() => {
    setPageLoading(true);
    if (user?.fullName) {
      addPlayerIfNotExists().then(() => {
        setPageLoading(false);
      });
    }
  }, [user, user?.fullName]);

  function handlePlayerRegistrations(payload: any) {
    console.log(payload);
  }

  async function getPlayers() {
    const { data: groupPlayers } = await client
      .from("player_groups")
      .select("player_id")
      .eq("group_id", groupId);

    const { data } = await client
      .from("players")
      .select(
        `
      id,
      name,
      clerk_id,
      player_registrations (
        id,
        week_day,
        group_id
      )
    `
      )
      .eq("player_registrations.group_id", groupId)
      .in(
        "id",
        groupPlayers!.map((p) => p.player_id)
      );
    return data;
  }

  async function addPlayerIfNotExists() {
    let players = await getPlayers();
    if (!players?.find((p) => p.clerk_id === userId)) {
      try {
        await client
          .from("players")
          .insert({
            clerk_id: userId,
            name: user!.fullName,
          })
          .select()
          .maybeSingle();

        players = await getPlayers();
      } catch (err) {
        console.log(err);
      }
    }
    setPlayers(players);
  }

  async function handleSelectDay(d: dayjs.Dayjs, registrationId?: number) {
    try {
      if (registrationId) {
        await client
          .from("player_registrations")
          .delete()
          .eq("id", registrationId);
        toast(`Not comming on ${d.format("ddd DD")}`);
      } else {
        await client.from("player_registrations").insert({
          player_id: playerId,
          week_day: d.toDate(),
          group_id: groupId,
        });
        toast(`Come on ${d.format("ddd DD")}`);
      }

      const data = await getPlayers();
      setPlayers(data);
    } catch (err) {
      console.log(err);
      toast.error(
        "Oops! can not register now, contact developer for fixing this shit!"
      );
    } finally {
    }
  }

  if (pageLoading) {
    return (
      <div className="bg-white flex flex-col gap-2">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <PageContainer>
      <LinkButton
        icon={<IoPeople />}
        href={`/group/${groupId}/membership`}
        label="Manage membership"
      ></LinkButton>
      <div className="flex flex-col justify-start items-start w-full gap-1">
        {players &&
          players.map((player, i) => {
            const mine = userId == player.clerk_id;
            return (
              <div
                key={i}
                className="flex items-center gap-1 w-full h-10 text-xs"
              >
                <div className="w-14 h-full flex items-center overflow-hidden text-ellipsis">
                  {mine ? (
                    <div className="w-10 h-10 bg-slate-100 text-white flex items-center justify-center rounded-full">
                      <UserButton defaultOpen={false} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full relative">
                      {player.name.split(" ")[0][0]}
                      {player.name.split(" ")[1][0]}
                      <span className="w-3 h-3 bg-green-500 rounded-full top-1 -right-1 absolute"></span>
                    </div>
                  )}
                </div>

                <div className="h-full grid grid-cols-7 gap-1 flex-1">
                  {weekDays.map((day, j) => {
                    const registration = player.player_registrations
                      .map((r: any) => ({ day: r.week_day, id: r.id }))
                      .find(
                        (d: any) => dayjs(d.day).weekday() == day.weekday()
                      );
                    const isBooked = !!registration;

                    return (
                      <button
                        disabled={!mine}
                        onClick={() => handleSelectDay(day, registration?.id)}
                        className={cn(
                          "border border-green-200 h-full flex text-center justify-center items-center w-full rounded-lg ring-green-500",
                          {
                            "active:ring-2 active:ring-green-500 active:ring-offset-2":
                              mine,
                            "bg-green-100": mine && !isBooked,
                            "bg-slate-50": !mine && !isBooked,
                            "bg-green-500 text-white font-bold":
                              mine && isBooked,
                            "bg-green-500/50 text-white font-bold":
                              !mine && isBooked,
                          }
                        )}
                        key={j}
                      >
                        {day.format("ddd")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </PageContainer>
  );
}
