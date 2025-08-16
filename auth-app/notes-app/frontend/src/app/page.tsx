"use client";
import Navbar from '@/components/Navbar';
import React from 'react'

const page = () => {

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // Handle form submission
    try {
      const response = await fetch('http://localhost:8000/api/notes', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("Form submitted successfully:", data);
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  return (
    <div className='w-screen h-screen m-auto'>
      <Navbar />
      {/* <AuthButton /> */}
      <button onClick={handleSubmit} className='ml-4 p-2 bg-blue-500 text-white rounded'>Click Me</button>
    </div>
  )
}

export default page