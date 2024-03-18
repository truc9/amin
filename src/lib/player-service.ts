import { createClient } from "@/utils/supabase/client"
import dayjs from "dayjs"

/**
 * Get players & their registrations
 * @param groupId Group ID
 * @returns player infor and their registrations
 */
export async function getRegistrations(groupId: number, startWeek: Date) {
    const client = createClient()
    // get all player IDs of current group
    const { data: groupPlayers } = await client
        .from("player_groups")
        .select("player_id")
        .eq("group_id", groupId)

    // get all players of this group & their's registrations
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
        .gte("player_registrations.week_day", dayjs(startWeek).format('YYYY-MM-DD'))
        .lte("player_registrations.week_day", dayjs(startWeek).add(6, 'day').format('YYYY-MM-DD'))
        .in(
            "id",
            groupPlayers!.map((p) => p.player_id)
        )
    return data
}