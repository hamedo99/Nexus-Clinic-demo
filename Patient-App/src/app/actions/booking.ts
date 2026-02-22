"use server";

import {
    fetchMonthAvailability,
    validateAndCreateBooking
} from "@/lib/shared-logic/bookings";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Calculates availability for a given month. (Patient Side)
 */
export async function getMonthAvailability(year: number, month: number, doctorId?: string) {
    return await fetchMonthAvailability(year, month, doctorId);
}

/**
 * Creates a new booking from the patient-facing form.
 */
export async function createBooking(prevState: any, formData: FormData) {
    // 1. Bot Honeypot
    const honeypot = formData.get("website_url") as string;
    if (honeypot) {
        console.log("Bot detected via honeypot field. Silently rejecting.");
        return { message: "تم إرسال طلب الحجز بنجاح!", success: true };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const doctorId = formData.get("doctorId") as string | undefined;

    if (!name || !phone || !dateStr) {
        return { message: "الرجاء ملء جميع الحقول", success: false };
    }

    // 2. IP Extraction (For logging / manual blocking without Redis)
    try {
        const _headers = await headers();
        const ip = _headers.get('x-forwarded-for') || "unknown";
        console.log(`Booking attempt from IP: ${ip}, Phone: ${phone}`);
    } catch (e) { /* ignore header error */ }

    // 3. Database-Level Throttling (Phone Number)
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        // Anti-Spam: Block if same phone booked within last 2 hours
        const recentBooking = await prisma.appointment.findFirst({
            where: {
                patient: { phoneNumber: phone },
                createdAt: { gte: twoHoursAgo }
            }
        });

        if (recentBooking) {
            return { message: "عذراً، لقد قمت بحجز موعد مؤخراً. يرجى الانتظار قليلاً أو الاتصال بالعيادة.", success: false };
        }

        // Active Load Limit: Max 2 upcoming active bookings
        const activeBookingsCount = await prisma.appointment.count({
            where: {
                patient: { phoneNumber: phone },
                status: { in: ["PENDING", "CONFIRMED"] },
                startTime: { gte: new Date() }
            }
        });

        if (activeBookingsCount >= 2) {
            return { message: "عذراً، لديك بالفعل موعدين نشطين قادمين. لا يمكنك حجز المزيد حالياً.", success: false };
        }
    } catch (dbError) {
        console.error("Rate limit DB check failed:", dbError);
    }

    const startTime = new Date(dateStr);
    if (timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        startTime.setHours(hours, minutes, 0, 0);
    } else {
        startTime.setHours(10, 0, 0, 0);
    }

    const result = await validateAndCreateBooking({
        patientName: name,
        patientPhone: phone,
        startTime,
        doctorId
    });

    if (result.success) {
        return { message: "تم إرسال طلب الحجز بنجاح!", success: true };
    }

    return { message: result.message || "حدث خطأ أثناء الحجز", success: false };
}