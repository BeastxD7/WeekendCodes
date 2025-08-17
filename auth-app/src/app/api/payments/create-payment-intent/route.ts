import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: Request) {
  const { priceId, userId, creditsToAdd } = await request.json();

  // Fetch price details from Stripe
  const price = await stripe.prices.retrieve(priceId);
  if (!price.unit_amount || !price.currency) {
    return Response.json({ error: "Invalid priceId or price missing amount/currency" }, { status: 400 });
  }

  // Create a PaymentIntent for the selected price
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price.unit_amount, // amount in cents
    currency: price.currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: userId || "",
      credits: creditsToAdd || "1",
      priceId,
      productId: typeof price.product === "string" ? price.product : ""
    },
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
