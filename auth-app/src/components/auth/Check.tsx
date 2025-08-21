"use client";
import { useSession } from "next-auth/react";
import { SignIn } from "./signin-button";
import { UserAvatar } from "./UserAvatar";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { getCredits } from "@/utils/getCredits";



export default function CheckAuthPage() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.email && session?.user?.email !== "") {
        const data = await getCredits(session.user.email);
        setCredits(data.credits || 0);
      }
    };
    fetchData();
  }, [session]);

  if (session?.user) {
    return (
      <div >
        <div className="flex items-center justify-between gap-20 py-10">
          <p>You are logged in, welcome, {session.user.name}!</p>
          <UserAvatar session={session} />
        </div>
        <div className="pb-10">
          <p>Your Credits: {credits}</p>
        </div>
        <Button variant="secondary">
          <Link href="/buy-credits">Buy Credits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p>You are not authorized to view this page!</p>
      <p>
        Please sign in to access this page. <SignIn />
      </p>
    </div>
  );
}
