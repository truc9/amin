"use client";

import React, { Suspense } from "react";
import { Button, PageContainer, LoadingSkeleton, TextBox } from "@/components";
import { IoSend } from "react-icons/io5";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

export default function Page() {
  const supabase = createClient();
  const { user } = useUser();
  const { data: player } = React.use(
    supabase.from("players").select("id").eq("clerk_id", user?.id).maybeSingle()
  );

  async function submitGroup(f: FormData) {
    if (!f.get("name")) {
      toast.error("Missing name");
      return;
    }
    const res = await supabase
      .from("groups")
      .insert({
        name: f.get("name"),
        created_by: player?.id,
      })
      .select();
    window.location.href = "/group";
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageContainer>
        <form className="flex flex-col gap-3" action={submitGroup}>
          <TextBox name="name" placeholder="Enter group name..."></TextBox>
          <Button icon={<IoSend />} label="Save" type="submit"></Button>
        </form>
      </PageContainer>
    </Suspense>
  );
}
