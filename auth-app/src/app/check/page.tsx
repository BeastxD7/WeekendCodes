import { SessionProvider } from 'next-auth/react'
import React from 'react'
import CheckAuthPage from '../components/Check'

const CheckPage = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
        <SessionProvider>
          <CheckAuthPage />
        </SessionProvider>
    </div>
  )
}

export default CheckPage