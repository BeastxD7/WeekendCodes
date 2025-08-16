"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button onClick={() => signIn("google")} variant="outline">
        Sign in
      </Button>
    );
  }

  return (
    <>
      {/* <p>{session.user?.name}</p> */}
      <Button onClick={() => signOut()} variant="default">
        Sign out
      </Button>
    </>
  );
}
