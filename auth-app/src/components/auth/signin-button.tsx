"use client"
import { signIn } from "next-auth/react"
import { Button } from "../ui/button"

export function SignIn() {
  return (
    <Button
      variant="default"
      onClick={() => signIn("google", { callbackUrl: "/check" })}
    >
      Sign In
    </Button>
  )
}