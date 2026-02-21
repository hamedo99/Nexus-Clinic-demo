"use server";

import { revalidatePath } from "next/cache";
import {
    fetchMonthAvailability,
    validateAndCreateBooking
} from "@nexus/shared";

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
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const doctorId = formData.get("doctorId") as string | undefined;

    if (!name || !phone || !dateStr) {
        return { message: "الرجاء ملء جميع الحقول", success: false };
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
        revalidatePath("/dashboard");
        return { message: "تم إرسال طلب الحجز بنجاح!", success: true };
    }

    return { message: result.message || "حدث خطأ أثناء الحجز", success: false };
}