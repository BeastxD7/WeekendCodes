"use client"
import { useSession } from "next-auth/react"
import { SignIn } from "./signin-button"
import { SignOut } from "./signout-button"
import { UserAvatar } from "./UserAvatar"

export default function CheckAuthPage() {
  const { data: session } = useSession()
 
  if (session?.user) {
    return (
      <div className=" "> 
        <div>
          <p>You are logged in, welcome, {session.user.name}!</p>
          <UserAvatar session={session} />
        </div>
        <p><SignOut /></p>
      </div>
    )
  }
 
  return (
    <div>
      <p>You are not authorized to view this page!</p>
      <p>Please sign in to access this page. <SignIn /></p>
    </div>
  )
}