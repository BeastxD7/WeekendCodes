import { rzp } from "@/razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount } = await req.json();

  try {
    const order = await rzp.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
    return NextResponse.json({ message: "hi there" });
}