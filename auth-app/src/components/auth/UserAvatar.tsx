import type { Session } from "next-auth"
import Image from "next/image"
 
export function UserAvatar({ session }: { session: Session | null }) {
  return (
    <div className="rounded-full overflow-hidden">
      <Image
        src={session?.user?.image ?? "https://i.pravatar.cc/300"}
        alt="User Avatar"
        width={50}
        height={50}
      />
    </div>
  )
}