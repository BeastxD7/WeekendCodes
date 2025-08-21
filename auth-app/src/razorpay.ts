import  Razorpay from 'razorpay'

export const rzp = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // your `KEY_ID`
  key_secret: process.env.RAZORPAY_SECRET_KEY // your `KEY_SECRET`
})
