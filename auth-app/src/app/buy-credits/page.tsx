"use client"
import { getCredits } from '@/utils/getCredits';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import React, { useEffect, useState } from 'react'

const PLANS = [
  { credits: 100, price: 100 },
  { credits: 500, price: 400 },
  { credits: 1000, price: 800 },
];

const BuyCredits = () => {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      const fetchCredits = async () => {
        setLoading(true);
        const credits = await getCredits(session.user?.email || "");
        setCredits(credits?.credits);
        setLoading(false);
      };
      fetchCredits();
    }
  }, [session]);

  const handleRazorpayPayment = async (planCredits: number, planPrice: number) => {
    // 1. Create order from backend
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: planPrice }), // Amount in INR
    });
    const { orderId } = await res.json();

    // 2. Open Razorpay modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: planPrice * 100, // Amount in paise
      currency: "INR",
      name: "Test Store",
      description: `Buy ${planCredits} Credits`,
      order_id: orderId,
      handler: async function (response: any) {
        if (session && session.user && session.user.email) {
          await fetch("/api/credits", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email, credits: planCredits }),
          });
          // Optionally refresh credits after purchase
          const credits = await getCredits(session.user.email);
          setCredits(credits?.credits);
        }
      },
      prefill: {
        name: session?.user?.name || "User Name",
        email: session?.user?.email || "user@example.com",
      },
      theme: { color: "#3399cc" },
    };

    // @ts-ignore
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className='w-container flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100'>
      <div>
        <div className='flex w-full justify-center items-center mb-8'>
          <h1 className="text-3xl font-bold text-gray-800">Your Credits: {loading ? "Loading..." : credits}</h1>
        </div>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <div className="flex flex-wrap gap-8 justify-center">
          {PLANS.map((plan) => (
            <div
              key={plan.credits}
              className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center max-w-sm border border-blue-200 hover:shadow-2xl transition duration-200"
            >
              <h2 className="text-xl font-bold mb-2 text-blue-700">{plan.credits} Credits</h2>
              <span className="text-4xl font-extrabold text-blue-600 mb-2">₹{plan.price}</span>
              <p className="mb-6 text-gray-600">Get <span className="font-bold">{plan.credits} Credits</span> for <span className="font-bold">₹{plan.price}</span></p>
              <button
                onClick={() => handleRazorpayPayment(plan.credits, plan.price)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow"
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BuyCredits