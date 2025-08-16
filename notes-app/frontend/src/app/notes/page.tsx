import { DialogDemo } from '@/components/DialogBox';
import React from 'react'

const Page = () => {

  return (
    <div className='m-auto max-w-7xl h-3/4 '>
      <div className='py-4 px-8 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Your Notes</h1>
        <DialogDemo  />
      </div>
    </div>
  )
}

export default Page