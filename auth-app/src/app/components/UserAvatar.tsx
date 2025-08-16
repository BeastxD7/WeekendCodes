import type { Session } from "next-auth"
import Image from "next/image"
 
export function UserAvatar({ session }: { session: Session | null }) {
  return (
    <div>
      <Image
        src={session?.user?.image ?? "https://i.pravatar.cc/300"}
        alt="User Avatar"
        width={100}
        height={100}
      />
    </div>
  )
}