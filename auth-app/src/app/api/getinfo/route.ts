import { NextRequest,NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma";


export async function POST (req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }


async function getUserCredits(email: string) {
    return await prisma.user.findUnique({
        where: { email: email },select: {
          credits: true
        }
    });
}

const userCredits = await getUserCredits(email);
  if (!userCredits) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ userCredits });
}
