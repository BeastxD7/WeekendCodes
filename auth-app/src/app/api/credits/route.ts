import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma';



export async function PUT(req: NextRequest) {
    const { email, credits } = await req.json();

    if (!email || typeof credits !== 'number') {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { credits: { increment: credits } },
        });

        return NextResponse.json({ message: 'Credits updated', email, credits: user.credits });
    } catch (error) {
        return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }
}