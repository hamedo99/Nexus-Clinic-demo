"use server";

import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { getClinicStatus } from "./clinic";
import { DashboardStats } from "@/lib/types";
import { unstable_cache } from "next/cache";

/**
 * Cached platform-wide statistics for administrative overview.
 * Refreshes every 10 minutes to maintain high performance.
 */
const getPlatformStats = unstable_cache(
    async () => {
        const [totalDoctors, totalApps, totalPats] = await Promise.all([
            prisma.doctor.count(),
            prisma.appointment.count(),
            prisma.patient.count()
        ]);
        return { totalDoctors, totalApps, totalPats };
    },
    ["platform-global-stats"],
    { revalidate: 600, tags: ["global-stats"] }
);

/**
 * Aggregates all statistics and recent data for the dashboard.
 */
export async function getDashboardStats(filterDoctorId?: string, currentSession?: any, selectedDate?: string, searchQuery?: string): Promise<DashboardStats | any> {
    noStore();
    try {
        const session = currentSession || await getSession() as any;
        if (!session) throw new Error("Unauthorized");

        let doctorFilter: any = {};
        const isAdmin = session.role === "ADMIN";

        if (isAdmin) {
            if (filterDoctorId && filterDoctorId !== "ALL") {
                doctorFilter = { doctorId: filterDoctorId };
            }
        } else {
            doctorFilter = { doctorId: session.doctorId || "00000000-0000-0000-0000-000000000000" };
        }

        const today = selectedDate ? new Date(selectedDate) : new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const [
            clinicStatus,
            appointments,
            newPatientsCount,
            pendingCount,
            todaysCount,
            platformStats
        ] = await Promise.all([
            getClinicStatus(doctorFilter.doctorId),
            prisma.appointment.findMany({
                where: {
                    ...doctorFilter,
                    status: { in: ["PENDING", "CONFIRMED"] },
                    ...(searchQuery ? {} : { startTime: { gte: startOfDay, lte: endOfDay } }),
                    ...(searchQuery ? {
                        OR: [
                            { patient: { fullName: { contains: searchQuery, mode: "insensitive" } } },
                            { patient: { phoneNumber: { contains: searchQuery, mode: "insensitive" } } }
                        ]
                    } : {})
                },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    status: true,
                    patient: { select: { id: true, fullName: true, phoneNumber: true } },
                    doctor: { select: { id: true, name: true } }
                },
                orderBy: [
                    { startTime: 'asc' },
                    { createdAt: 'asc' }
                ]
            }),
            prisma.patient.count({
                where: { ...doctorFilter, createdAt: { gte: startOfDay } }
            }),
            prisma.appointment.count({
                where: {
                    ...doctorFilter,
                    status: "PENDING",
                    startTime: { gte: startOfDay, lte: endOfDay }
                }
            }),
            prisma.appointment.count({
                where: {
                    ...doctorFilter,
                    startTime: { gte: startOfDay, lt: endOfDay },
                    status: { not: "CANCELLED" }
                }
            }),
            isAdmin ? getPlatformStats() : Promise.resolve({ totalDoctors: 0, totalApps: 0, totalPats: 0 })
        ]);


        return {
            clinicStatus,
            appointments,
            stats: {
                newPatients: newPatientsCount,
                pending: pendingCount,
                todayTotal: todaysCount,
                totalDoctors: platformStats.totalDoctors,
                platformTotalAppointments: platformStats.totalApps,
                platformTotalPatients: platformStats.totalPats,
                isGlobal: isAdmin && (!filterDoctorId || filterDoctorId === "ALL")
            }
        };
    } catch (error) {
        console.error("Dashboard Stats Fetch Error:", error);
        throw error; // Rethrow to let the UI / Error Boundary catch the actual error
    }
}

/**
 * Fetches upcoming appointments (strictly > end of today) and doctor's clinic locations for the upcoming table.
 */
export async function getUpcomingAppointments() {
    noStore();
    try {
        const session = await getSession() as any;
        if (!session) return { appointments: [], locations: [], isAdmin: false };

        const isAdmin = session.role === "ADMIN";
        const doctorFilter = isAdmin ? {} : { doctorId: session.doctorId };

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Fetch upcoming appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                ...doctorFilter,
                status: { in: ["PENDING", "CONFIRMED"] },
                startTime: { gt: endOfToday }
            },
            include: { patient: true },
            orderBy: { startTime: 'asc' }
        });

        // Fetch locations for filter
        let locations: string[] = [];
        if (!isAdmin && session.doctorId) {
            const doc = await prisma.doctor.findUnique({
                where: { id: session.doctorId },
                select: { clinic_locations: true }
            });
            if (doc?.clinic_locations && Array.isArray(doc.clinic_locations)) {
                locations = doc.clinic_locations.map((loc: any) => loc.name).filter(Boolean);
            }
        } else if (isAdmin) {
            const docs = await prisma.doctor.findMany({
                select: { clinic_locations: true }
            });
            const allLocs = new Set<string>();
            docs.forEach(d => {
                if (d.clinic_locations && Array.isArray(d.clinic_locations)) {
                    d.clinic_locations.forEach((l: any) => { if (l.name) allLocs.add(l.name); });
                }
            });
            locations = Array.from(allLocs);
        }

        return { appointments, locations, isAdmin };
    } catch (error) {
        return { appointments: [], locations: [], isAdmin: false };
    }
}
