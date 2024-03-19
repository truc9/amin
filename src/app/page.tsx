"use client";

import { LoadingSkeleton, PageContainer } from "@/components";
import { addPlayerIfNotExists } from "@/lib/player-service";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PulseLoader } from "react-spinners";

export default function Page() {
  const { isSignedIn, user } = useUser();
  const client = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && user) {
      (async () => {
        setLoading(true);
        const res = await client
          .from("players")
          .select("id")
          .eq("clerk_id", user?.id)
          .maybeSingle();
        if (!res.data) {
          await addPlayerIfNotExists(user.id!, user.fullName!);
        }
        router.push("/group");
        setLoading(false);
      })();
    }
  }, [isSignedIn, user]);

  return (
    <PageContainer>
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="flex items-center justify-center flex-col gap-3 min-h-40">
          <PulseLoader />
          <h3>Adding you as a player...</h3>
        </div>
      </Suspense>
    </PageContainer>
  );
}
