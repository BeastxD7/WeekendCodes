"use client"
import { signOut } from "next-auth/react"
 
export function SignOut() {
  return <button className="bg-red-500 text-white p-2 rounded" onClick={() => signOut()}>Sign Out</button>
}