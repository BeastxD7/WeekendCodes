import StripeCheckout from '@/components/payments/StripeCheckout'
import React from 'react'

const BuyCredits = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-primary">Buy Credits</h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-300 text-center">
          Purchase credits to unlock premium features and more. Secure payment powered by Stripe.
        </p>
        <StripeCheckout
          amount={10}
        />
      </div>
    </div>
  )
}

export default BuyCredits