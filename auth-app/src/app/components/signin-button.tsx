"use client"
import { signIn } from "next-auth/react"

export function SignIn() {
  return <button className="bg-blue-500 text-white p-2 rounded" onClick={() => signIn("google")}>Sign In</button>
}