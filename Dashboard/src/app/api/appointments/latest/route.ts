import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const since = searchParams.get('since');

        if (!since) {
            return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 });
        }

        const dateSince = new Date(since);

        // Find appointments created after the specified time
        const newAppointments = await prisma.appointment.findMany({
            where: {
                createdAt: {
                    gt: dateSince
                },
                ...(session.role === 'SECRETARY' && session.doctorId ? { doctorId: session.doctorId } : {})
            },
            include: {
                patient: true,
                doctor: true
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

    } catch (error) {
        console.error('Error fetching latest appointments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
