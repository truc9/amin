import { createClient } from "@/utils/supabase/client"
import dayjs from "dayjs"

/**
 * Get all players
 * @returns players
 */
export async function getPlayers() {
    const client = createClient()
    const { data } = await client.from("players").select()
    return data
}

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
        .select(`
            id,
            name,
            clerk_id,
            player_registrations (
                id,
                week_day,
                group_id
            )
        `)
        .eq("player_registrations.group_id", groupId)
        .gte("player_registrations.week_day", dayjs(startWeek).format('YYYY-MM-DD'))
        .lte("player_registrations.week_day", dayjs(startWeek).add(6, 'day').format('YYYY-MM-DD'))
        .in(
            "id",
            groupPlayers!.map((p) => p.player_id)
        )
    return data
}

/**
 * When user logging in, added user as a player
 * @param clerkId identity server ID (ClerkID)
 * @param name user name
 */
export async function addPlayerIfNotExists(clerkId: string, name: string) {
    const client = createClient()
    const player = await client
        .from("players")
        .select()
        .eq("clerk_id", clerkId)
        .maybeSingle()

    if (!player.data) {
        await client
            .from("players")
            .insert({
                clerk_id: clerkId,
                name: name,
            })
            .select()
            .maybeSingle()
    }
}

/**
 * Unregister a date
 * @param registrationId registerID
 */
export async function unregister(registrationId: number) {
    const client = createClient()
    await client
        .from("player_registrations")
        .delete()
        .eq("id", registrationId)
}

/**
 * Register date for player in the group
 * @param groupId group id
 * @param playerId player id
 * @param d registered date
 */
export async function register(groupId: number, playerId: number, d: Date) {
    const client = createClient()
    await client.from("player_registrations").insert({
        player_id: playerId,
        week_day: d,
        group_id: groupId,
    })
}

/**
 * Remove player from the group
 * @param groupId group id
 * @param playerId player id
 */
export async function removePlayerFromGroup(groupId: number, playerId: number) {
    const client = createClient()
    await client.from("player_groups").delete().match({
        player_id: playerId,
        group_id: groupId,
    })
    await client
        .from("player_registrations")
        .delete()
        .eq("player_id", playerId)
}
/**
 * Add player to the group
 * @param groupId group id
 * @param playerId player id
 */
export async function addPlayerToGroup(groupId: number, playerId: number) {
    const client = createClient()
    await client
        .from("player_groups")
        .insert({
            player_id: playerId,
            group_id: groupId,
        })
        .select()
        .maybeSingle()
}

/**
 * Check if player exists in group
 * @param groupId group id
 * @param playerId player id
 * @returns true if player in the group
 */
export async function checkPlayerExistInGroup(groupId: number, playerId: number) {
    const client = createClient()
    const existing = await client
        .from("player_groups")
        .select("id")
        .match({
            player_id: playerId,
            group_id: groupId,
        })
        .maybeSingle()
    return !!existing.data
}

/**
 * Get players in the group
 * @returns players
 */
export async function getGroupPlayers(groupId: number) {
    const client = createClient()
    const { data } = await client
        .from("player_groups")
        .select()
        .eq("group_id", groupId)
    return data
}
