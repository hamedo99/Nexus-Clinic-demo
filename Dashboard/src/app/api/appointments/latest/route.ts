import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod'; // SECURITY FIX: Add Zod for parameter validation
import { isRateLimited } from '@/lib/rateLimit';

export async function GET(request: Request) {
    try {
        // SECURITY FIX: Rate limiting (HIGH #4)
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        if (isRateLimited(ip, 30, 60 * 1000)) { // 30 reqs per minute for polling endpoint
             return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sinceRaw = searchParams.get('since');

        // SECURITY FIX: Add Zod validation for since parameter (ADDITIONAL REQ 4)
        // Validates it is a valid ISO date string
        const querySchema = z.object({
            since: z.string().datetime()
        });

        const validation = querySchema.safeParse({ since: sinceRaw });

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid since parameter, must be a valid ISO format.' }, { status: 400 });
        }

        const dateSince = new Date(validation.data.since);

        // Find appointments created after the specified time
        const newAppointments = await prisma.appointment.findMany({
            where: {
                createdAt: {
                    gt: dateSince
                },
                ...(session.role !== 'ADMIN' && session.doctorId ? { doctorId: session.doctorId } : {})
            },
            select: {
                id: true,
                startTime: true,
                status: true,
                createdAt: true,
                patient: { select: { id: true, fullName: true, phoneNumber: true } },
                doctor: { select: { id: true, name: true } }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Return current server time to avoid client/server clock drifts
        return NextResponse.json({
            appointments: newAppointments,
            serverTime: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Error fetching latest appointments:', error);
        return NextResponse.json({
            appointments: [],
            serverTime: new Date().toISOString(),
            error: 'Failed'
        }, { status: 200 });
    }
}
