import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../prisma/prisma";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-07-30.basil" });

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const buf = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata.userId;
    const creditsToAdd = Number(paymentIntent.metadata.credits) || 1;
    if (userId) {
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: creditsToAdd } },
        });
    }
}
  return new Response("ok");
}