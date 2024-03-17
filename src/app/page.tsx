import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { IoAdd, IoChevronForward } from "react-icons/io5";
import { Suspense, use, useEffect } from "react";
import { PageContainer } from "@/components/page-container";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Page() {
  const supabase = createClient();
  const user = use(currentUser());
  const { data: player } = use(
    supabase.from("players").select("id").eq("clerk_id", user?.id).maybeSingle()
  );
  const { data: joinedGroups } = use(getJoinedGroups(player?.id));
  const { data: myGroups } = use(getMyGroups(player?.id));

  function getMyGroups(playerId: number) {
    return supabase
      .from("groups")
      .select()
      .eq("created_by", playerId)
      .order("created_at", { ascending: false });
  }

  function getJoinedGroups(playerId: number) {
    return supabase
      .from("player_groups")
      .select(
        `
        id,
        player_id,
        group_id,
        players(id, name),
        groups(id, name),
        created_at
      `
      )
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });
  }

  return (
    <PageContainer>
      <Link
        href="/group/create"
        className="bg-green-400 text-white px-2 py-3 rounded text-center flex items-center gap-2 justify-center"
      >
        <IoAdd size={20} />
        <span>Create Group</span>
      </Link>
      <Suspense fallback={<LoadingSkeleton />}>
        <h3 className="text-xl font-bold">My Groups</h3>
        <div className="flex flex-col gap-3 bg-slate-100 h-full">
          {myGroups?.map((group, index) => {
            return (
              <Link
                href={`group/${group.id}`}
                className="bg-green-50 border-green-500 border rounded p-4 flex justify-between items-center"
                key={group.id}
              >
                <span>
                  {group.name} ({dayjs(group.created_at).fromNow()})
                </span>
                <IoChevronForward size={20} />
              </Link>
            );
          })}
        </div>
      </Suspense>
    </PageContainer>
  );
}
