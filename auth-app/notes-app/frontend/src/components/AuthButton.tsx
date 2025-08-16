"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in</button>;
  }

  return (
    <>
      {/* <p>{session.user?.name}</p> */}
      <button onClick={() => signOut()}>Sign out</button>
    </>
  );
}
