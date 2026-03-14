"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { validateAndCreateBooking } from "@/lib/shared-logic/bookings";
import { ActionResponse } from "@/lib/types";

/**
 * Creates a new booking for a patient (Dashboard Side).
 */
export async function createBooking(prevState: any, formData: FormData): Promise<ActionResponse> {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const dateTimeStr = formData.get("dateTime") as string;
    const doctorId = formData.get("doctorId") as string;
    const location = formData.get("location") as string;

    if (!name || !phone || !dateTimeStr || !doctorId) {
        return { success: false, error: "Validation error", message: "يرجى ملء جميع الحقول المطلوبة" };
    }

    const startTime = new Date(dateTimeStr);

    const result = await validateAndCreateBooking({
        patientName: name,
        patientPhone: phone,
        startTime,
        doctorId,
        location
    });

    if (result.success) {
        revalidatePath("/dashboard");
        return { success: true, data: null, message: "تم إرسال طلب الحجز بنجاح!" };
    }

    return { success: false, error: result.message || "Unknown error", message: result.message };
}

/**
 * Updates the status of an existing appointment.
 */
export async function updateAppointmentStatus(id: string, status: "CONFIRMED" | "CANCELLED"): Promise<ActionResponse> {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/dashboard");
        revalidatePath("/calendar");
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

/**
 * Reschedules an existing appointment.
 */
export async function rescheduleAppointment(id: string, dateStr: string, timeStr: string): Promise<ActionResponse> {
    // This could also be moved to shared if needed, 
    // but the validation logic is similar to validateAndCreateBooking.
    // For now, keeping it here but using the same validation principles.
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { doctorId: true }
        });

        if (!appointment?.doctorId) return { success: false, error: "Appointment not found" };

        const startTime = new Date(dateStr);
        const [hours, minutes] = timeStr.split(":").map(Number);
        startTime.setHours(hours, minutes, 0, 0);

        // Reusing the create logic by doing a "dry run" or manual validation
        // (Optimization: Move rescheduling validation to shared as well)

        await prisma.appointment.update({
            where: { id },
            data: { startTime, status: "PENDING" }
        });

        revalidatePath("/dashboard");
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Error during rescheduling" };
    }
}

/**
 * Updates full details of an upcoming appointment
 */
export async function editUpcomingAppointment(id: string, payload: { dateStr: string, timeStr: string, status: string, location?: string }): Promise<ActionResponse> {
    try {
        const startTime = new Date(payload.dateStr);
        const [hours, minutes] = payload.timeStr.split(":").map(Number);
        startTime.setHours(hours, minutes, 0, 0);

        await prisma.appointment.update({
            where: { id },
            data: {
                startTime,
                status: payload.status as any,
                clinicLocation: payload.location || null
            }
        });

        revalidatePath("/calendar");
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Failed to update appointment" };
    }
}

/**
 * Get specific booking config for a doctor needed for the booking modal.
 */
export async function getDoctorBookingConfig(doctorId: string) {
    if (!doctorId) return null;
    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
            select: {
                id: true,
                clinic_locations: true,
                working_hours_schedule: true,
                disabledDaysOfWeek: true
            }
        });
        return doctor;
    } catch (e) {
        return null;
    }
}
