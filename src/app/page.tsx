"use client";

import { Button, LoadingSkeleton, PageContainer } from "@/components";
import { addPlayerIfNotExists } from "@/lib/player-service";
import { useUser } from "@clerk/nextjs";
import { IoLink } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const { isSignedIn, user } = useUser();
  const client = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      (async () => {
        const res = await client
          .from("players")
          .select("id")
          .eq("clerk_id", user?.id)
          .maybeSingle();
        if (res.data) {
          router.push("/group");
        }
      })();
    }
  }, [isSignedIn, user]);

  async function handleJoin() {
    if (isSignedIn && user) {
      await addPlayerIfNotExists(user.id!, user.fullName!);
      router.push("/group");
    }
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageContainer>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="text-lg">
              <h3>Welcome to amin!</h3>
              <small>Connect your friends and play badminton</small>
            </div>
            <Button
              icon={<IoLink />}
              label="Click to join"
              onClick={handleJoin}
            ></Button>
          </>
        )}
      </PageContainer>
    </Suspense>
  );
}
