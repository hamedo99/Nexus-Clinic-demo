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
        return null;
    }
}

/**
 * Fetches appointments for the calendar view.
 */
export async function getCalendarAppointments() {
    noStore();
    try {
        const session = await getSession() as any;
        if (!session) return [];

        const doctorFilter = session.role === "ADMIN" ? {} : { doctorId: session.doctorId };
        const startOfMonth = new Date();
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);

        return await prisma.appointment.findMany({
            where: {
                ...doctorFilter,
                status: { in: ["PENDING", "CONFIRMED"] },
                startTime: { gte: startOfMonth }
            },
            include: { patient: true },
        });
    } catch (error) {
        return [];
    }
}
