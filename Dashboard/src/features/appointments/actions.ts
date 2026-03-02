"use server";

import { revalidatePath } from "next/cache";
import { appointmentService } from "./services";
import { appointmentSchema, updateStatusSchema, rescheduleSchema } from "./schemas";
import { ActionResponse } from "@/lib/types";

export async function createBookingAction(prevState: any, formData: FormData): Promise<ActionResponse> {
    const rawData = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        doctorId: formData.get("doctorId") as string,
    };

    const parsedData = appointmentSchema.safeParse(rawData);
    if (!parsedData.success) {
        return {
            success: false,
            error: "Validation error",
            message: parsedData.error.issues.map(e => e.message).join(", ")
        };
    }

    const result = await appointmentService.createBooking(parsedData.data);

    if (result.success) {
        revalidatePath("/dashboard");
        revalidatePath("/calendar");
        return { success: true, data: null, message: "تم إرسال طلب الحجز بنجاح!" };
    }

    return { success: false, error: result.message || "Unknown error", message: result.message };
}

export async function updateAppointmentStatusAction(id: string, status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED" | "NO_SHOW" | "IN_PROGRESS" | "ARRIVED"): Promise<ActionResponse> {
    const rawData = { id, status };
    const parsedData = updateStatusSchema.safeParse(rawData);
    if (!parsedData.success) {
        return { success: false, error: "Invalid input" };
    }

    try {
        await appointmentService.updateAppointmentStatus(parsedData.data.id, parsedData.data.status);
        revalidatePath("/dashboard");
        revalidatePath("/calendar");
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function rescheduleAppointmentAction(id: string, dateStr: string, timeStr: string): Promise<ActionResponse> {
    const rawData = { id, dateStr, timeStr };
    const parsedData = rescheduleSchema.safeParse(rawData);
    if (!parsedData.success) {
        return { success: false, error: "Invalid input" };
    }

    try {
        await appointmentService.rescheduleAppointment(parsedData.data.id, parsedData.data.dateStr, parsedData.data.timeStr);
        revalidatePath("/dashboard");
        revalidatePath("/calendar");
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Error during rescheduling" };
    }
}
