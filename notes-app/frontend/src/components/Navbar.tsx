import React from 'react'
import AuthButton from './AuthButton'
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className='max-w-7xl m-auto bg-gray-800 p-6 rounded-b-3xl shadow-lg'>
      <div className='flex justify-between items-center container mx-auto'>
        <h1 className='text-white text-lg font-bold'>Notes App</h1>
        
            <ul className='md:flex gap-4 hidden items-center'>
                <Link href="/" className='text-white hover:text-gray-300 '>Home</Link>
                <Link href="/notes" className='text-white hover:text-gray-300 '>Notes</Link>
                <Link href="/about" className='text-white hover:text-gray-300 '>About</Link>
                <AuthButton />
            </ul>
      </div>
    </nav>
  )
}

export default Navbar