import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createClient } from "@/utils/supabase/server";
import { currentUser } from "@clerk/nextjs/server";
import { IoAdd, IoChevronForward } from "react-icons/io5";
import { Suspense, use } from "react";
import { LinkButton, PageContainer, LoadingSkeleton } from "@/components";

dayjs.extend(relativeTime);

export default function Page() {
  const supabase = createClient();
  const user = use(currentUser());
  const { data: player } = use(
    supabase.from("players").select("id").eq("clerk_id", user?.id).maybeSingle()
  );
  const invitedGroups = use(getInvitedGroups(player?.id));
  const myGroups = use(getMyGroups(player?.id));

  async function getMyGroups(playerId: number) {
    const res = await supabase
      .from("groups")
      .select()
      .eq("created_by", playerId)
      .order("created_at", { ascending: false });
    return res.data;
  }

  async function getInvitedGroups(playerId: number) {
    const groups = await supabase
      .from("player_groups")
      .select(
        `
      groups(*)
    `
      )
      .eq("player_id", playerId);
    const res = groups.data?.flatMap((g) => g.groups);
    debugger;
    return res;
  }

  return (
    <PageContainer>
      <LinkButton
        icon={<IoAdd />}
        href="/group/create"
        label="Create Group"
      ></LinkButton>
      <Suspense fallback={<LoadingSkeleton />}>
        <h3 className="text-xl font-bold">Membership</h3>
        <div className="flex flex-col gap-3 bg-slate-100 h-full">
          {invitedGroups?.map((group) => {
            return (
              <Link
                href={`group/${group.id}`}
                className="bg-green-50 border-green-500 border rounded p-4 flex justify-between items-center relative"
                key={group.id}
              >
                <div className="flex flex-col justify-start">
                  <span className="font-bold">{group.name}</span>
                  <span className="text-xs text-slate-500">
                    {dayjs(group.created_at).fromNow()}
                  </span>
                </div>
                <IoChevronForward size={20} />
              </Link>
            );
          })}
        </div>

        <h3 className="text-xl font-bold">My Groups</h3>
        <div className="flex flex-col gap-3 bg-slate-100 h-full">
          {myGroups?.map((group) => {
            return (
              <Link
                href={`group/${group.id}`}
                className="bg-green-50 border-green-500 border rounded p-4 flex justify-between items-center relative"
                key={group.id}
              >
                <div className="flex flex-col justify-start">
                  <span className="font-bold">{group.name}</span>
                  <span className="text-xs text-slate-500">
                    {dayjs(group.created_at).fromNow()}
                  </span>
                </div>
                <IoChevronForward size={20} />
              </Link>
            );
          })}
        </div>
      </Suspense>
    </PageContainer>
  );
}
