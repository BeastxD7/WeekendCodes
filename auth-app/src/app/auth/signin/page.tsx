
import { SignIn } from '@/components/auth/signin-button'
import { SignOut } from '@/components/auth/signout-button'
import React from 'react'

const SignInPage = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <SignIn />
    </div>
  )
}

export default SignInPage