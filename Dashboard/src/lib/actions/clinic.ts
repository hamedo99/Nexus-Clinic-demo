"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { WorkingHours } from "@/lib/types";

/**
 * Checks if the clinic is currently open based on working hours and blocked dates.
 */
export async function getClinicStatus(doctorId?: string) {
    const targetDoctorId = doctorId || (await getSession() as any)?.doctorId;

    if (!targetDoctorId) {
        return { isOpen: false, reason: "No doctor specified" };
    }

    const now = new Date();

    // 1. Check for active blocked time
    const blocked = await prisma.blockedTime.findFirst({
        where: {
            doctorId: targetDoctorId,
            startTime: { lte: now },
            endTime: { gte: now }
        },
        select: { reason: true }
    });

    if (blocked) {
        return { isOpen: false, reason: blocked.reason };
    }

    // 2. Check general working hours
    const doctor = await prisma.doctor.findUnique({
        where: { id: targetDoctorId },
        select: { workingHours: true }
    });

    const workingHours = ((doctor as any)?.workingHours as unknown as WorkingHours) || { start: 14, end: 21 };
    const hour = now.getHours();

    if (hour < workingHours.start || hour >= workingHours.end) {
        return { isOpen: false, reason: "خارج ساعات العمل" };
    }

    return { isOpen: true, reason: null };
}

/**
 * Validates if a specific time slot is available for booking.
 */
export async function isClinicOpenAt(date: Date, doctorId: string, durationMinutes: number = 20) {
    const startTime = new Date(date);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    // 1. Check Working Hours
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { workingHours: true }
    });

    const workingHours = ((doctor as any)?.workingHours as unknown as WorkingHours) || { start: 14, end: 21 };
    const hour = startTime.getHours();

    if (hour < workingHours.start || hour >= workingHours.end) {
        return {
            isOpen: false,
            reason: `عذراً، أوقات العيادة من ${formatHour(workingHours.start)} إلى ${formatHour(workingHours.end)} فقط.`
        };
    }

    // 2. Check Blocked Time
    const isBlocked = await prisma.blockedTime.findFirst({
        where: {
            doctorId: doctorId,
            startTime: { lte: startTime },
            endTime: { gte: endTime },
        },
        select: { id: true }
    });

    if (isBlocked) {
        return { isOpen: false, reason: "عذراً، العيادة مغلقة في هذا الوقت." };
    }

    return { isOpen: true };
}

function formatHour(h: number) {
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    return `${displayHour} ${period}`;
}
