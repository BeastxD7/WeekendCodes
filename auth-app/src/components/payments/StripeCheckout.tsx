"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (!stripe || !elements) return;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Optionally, redirect after payment
        return_url: window.location.origin + "/payment-success",
      },
    });
    if (error) setError(error.message || "Payment failed");
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="mt-4 px-4 py-2 bg-primary text-white rounded">
        {isLoading ? "Processing..." : "Pay"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}

export default function StripeCheckout({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Call backend to create PaymentIntent
    fetch("/api/payments/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: "price_1RwpfrSBZEI8rA37ZC3Alhnw",
        userId: session?.user?.id, // if using next-auth
        creditsToAdd: amount, // or any number of credits to add
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount, session]);

  const options = clientSecret
    ? {
        clientSecret,
        appearance: { theme: "stripe" as const },
      }
    : undefined;

  return options ? (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  ) : (
    <div>Loading payment...</div>
  );
}
