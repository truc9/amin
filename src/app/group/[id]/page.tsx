"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import cn from "classnames";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { LinkButton, PageContainer, LoadingSkeleton } from "@/components";
import { useParams } from "next/navigation";
import { IoCalendar, IoPeople } from "react-icons/io5";
import { getRegistrations, register, unregister } from "@/lib/player-service";

dayjs.extend(weekday);

export default function Page() {
  const { id: groupId } = useParams();
  const [players, setPlayers] = useState<any[] | null>();
  const { userId } = useAuth();
  const playerId = useMemo(() => {
    return players?.find((p) => p.clerk_id == userId)?.id;
  }, [players, userId]);

  const weekStart = dayjs().weekday(8);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((item) => {
    const d = weekStart.add(item, "day");
    return d;
  });

  useEffect(() => {
    loadRegistrations();

    async function loadRegistrations() {
      const registrations = await getRegistrations(
        Number(groupId),
        weekStart.toDate()
      );
      setPlayers(registrations);
    }
  }, []);

  async function handleSelectDay(d: dayjs.Dayjs, registrationId?: number) {
    try {
      if (registrationId) {
        await unregister(registrationId);
        toast(`Not comming on ${d.format("ddd DD")}`);
      } else {
        await register(Number(groupId), playerId, d.toDate());
        toast(`Come on ${d.format("ddd DD")}`);
      }

      const data = await getRegistrations(Number(groupId), weekStart.toDate());
      setPlayers(data);
    } catch (err) {
      toast.error(
        "Oops! can not register now, contact developer for fixing this shit!"
      );
    }
  }

  return (
    <PageContainer>
      <LinkButton
        icon={<IoPeople />}
        href={`/group/${groupId}/membership`}
        label="Manage membership"
      ></LinkButton>
      <h3 className="text-xl font-bold">Calendar</h3>
      <div className="flex items-center justify-between text-slate-500">
        <h3>{weekStart.format("ddd DD.MM.YYYY")}</h3>
        <h3>
          <IoCalendar size={20} />
        </h3>
        <h3>{weekStart.add(6, "day").format("ddd DD.MM.YYYY")}</h3>
      </div>

      <h3 className="text-xl font-bold">Registrations</h3>
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
                        {day.format("ddd DD")}
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
