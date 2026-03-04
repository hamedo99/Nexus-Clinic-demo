"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { settingsService } from "./services";
import { blockedDateSchema, blockDaysSchema, updateDoctorClinicSettingsSchema } from "./schemas";
import { ActionResponse } from "@/lib/types";

function revalidatePaths() {
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/book");
}

export async function addBlockedDateAction(range: { from: Date, to: Date }, reason: string): Promise<ActionResponse> {
    const session = await getSession() as any;
    if (!session?.doctorId) return { success: false, error: "Unauthorized" };

    const parsed = blockedDateSchema.safeParse({ from: range.from, to: range.to, reason });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    try {
        await settingsService.addBlockedDate(session.doctorId, parsed.data.from, parsed.data.to || parsed.data.from, parsed.data.reason);
        revalidatePaths();
        return { success: true, data: null };
    } catch {
        return { success: false, error: "Failed to add blocked date" };
    }
}

export async function deleteBlockedDateAction(id: string): Promise<ActionResponse> {
    const session = await getSession() as any;
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await settingsService.deleteBlockedDate(id, session.doctorId, session.role === "ADMIN");
        revalidatePaths();
        return { success: true, data: null };
    } catch {
        return { success: false, error: "Failed to delete blocked date" };
    }
}

export async function updateDoctorClinicSettingsAction(formData: FormData): Promise<ActionResponse> {
    const session = await getSession() as any;
    if (!session?.doctorId) return { success: false, error: "Unauthorized" };

    const rawData = {
        name: formData.get("name") || undefined,
        phone: formData.get("phone") || undefined,
        address: formData.get("address") || undefined,
        logo: formData.get("logo") || undefined,
        price: formData.get("price") ? parseInt(formData.get("price") as string) : undefined,
        patientsPerHour: formData.get("patientsPerHour") ? parseInt(formData.get("patientsPerHour") as string) : undefined,
        startHour: formData.get("startHour") ? parseInt(formData.get("startHour") as string) : undefined,
        endHour: formData.get("endHour") ? parseInt(formData.get("endHour") as string) : undefined,
    };

    const parsed = updateDoctorClinicSettingsSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Invalid data" };

    try {
        const updated = await settingsService.updateDoctorClinicSettings(session.doctorId, parsed.data);
        revalidatePaths();
        return { success: true, data: updated };
    } catch {
        return { success: false, error: "Failed to update settings" };
    }
}

export async function blockClinicDaysAction(dayCount: number, reason: string): Promise<ActionResponse> {
    const session = await getSession() as any;
    if (!session?.doctorId) return { success: false, error: "Unauthorized" };

    const parsed = blockDaysSchema.safeParse({ dayCount, reason });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    try {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + parsed.data.dayCount);

        await settingsService.addBlockedDate(session.doctorId, today, endDate, parsed.data.reason);
        revalidatePaths();
        return { success: true, data: null };
    } catch {
        return { success: false, error: "Failed to block clinic days" };
    }
}
