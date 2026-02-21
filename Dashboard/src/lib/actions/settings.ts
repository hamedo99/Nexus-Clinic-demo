"use server";

import { prisma } from "@nexus/shared";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { ActionResponse, WorkingHours } from "@/lib/types";

/**
 * Adds a blocked date range for a clinician.
 */
export async function addBlockedDate(range: { from: Date, to: Date }, reason: string): Promise<ActionResponse> {
    try {
        const session = await getSession() as any;
        if (!session?.doctorId) return { success: false, error: "Unauthorized" };

        const startTime = new Date(range.from);
        startTime.setHours(0, 0, 0, 0);

        const endTime = new Date(range.to || range.from);
        endTime.setHours(23, 59, 59, 999);

        await prisma.blockedTime.create({
            data: { startTime, endTime, reason, doctorId: session.doctorId },
        });

        revalidatePaths();
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Failed to add blocked date" };
    }
}

/**
 * Deletes a blocked date.
 */
export async function deleteBlockedDate(id: string): Promise<ActionResponse> {
    try {
        const session = await getSession() as any;
        if (!session) return { success: false, error: "Unauthorized" };

        await prisma.blockedTime.delete({
            where: {
                id,
                ...(session.role !== "ADMIN" ? { doctorId: session.doctorId } : {})
            }
        });

        revalidatePaths();
        return { success: true, data: null };
    } catch (error) {
        return { success: false, error: "Failed to delete blocked date" };
    }
}

/**
 * Retrieves all blocked dates for the current doctor.
 */
export async function getBlockedDates() {
    const session = await getSession() as any;
    if (!session?.doctorId) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.blockedTime.findMany({
        where: {
            doctorId: session.doctorId,
            endTime: { gte: today }
        },
        orderBy: { startTime: 'asc' }
    });
}

/**
 * Updates clinic specific settings for a doctor.
 */
export async function updateDoctorClinicSettings(formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getSession() as any;
        if (!session?.doctorId) return { success: false, error: "Unauthorized" };

        // Fetch current doctor data to have fallback values
        const currentDoctor = await prisma.doctor.findUnique({
            where: { id: session.doctorId },
            select: {
                name: true,
                clinicPhone: true,
                address: true,
                clinicLogo: true,
                consultationPrice: true,
                patientsPerHour: true,
                workingHours: true
            }
        });

        if (!currentDoctor) return { success: false, error: "Doctor not found" };

        // Process FormData with fallbacks to current values
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;
        const logo = formData.get("logo") as string;

        const priceRaw = formData.get("price");
        const price = priceRaw ? parseInt(priceRaw as string) : currentDoctor.consultationPrice;

        const patientsPerHourRaw = formData.get("patientsPerHour");
        const patientsPerHour = patientsPerHourRaw ? parseInt(patientsPerHourRaw as string) : currentDoctor.patientsPerHour;

        const startHourRaw = formData.get("startHour");
        const endHourRaw = formData.get("endHour");

        const currentWorkingHours = (currentDoctor.workingHours as any) || { start: 14, end: 21 };
        const workingHours = {
            start: startHourRaw ? parseInt(startHourRaw as string) : currentWorkingHours.start,
            end: endHourRaw ? parseInt(endHourRaw as string) : currentWorkingHours.end
        };

        const updatedDoctor = await prisma.doctor.update({
            where: { id: session.doctorId },
            data: {
                name: (name !== null && name !== undefined) ? name : currentDoctor.name,
                clinicPhone: (phone !== null && phone !== undefined) ? phone : currentDoctor.clinicPhone,
                address: (address !== null && address !== undefined) ? address : currentDoctor.address,
                clinicLogo: (logo !== null && logo !== undefined) ? logo : currentDoctor.clinicLogo,
                consultationPrice: isNaN(price as number) ? currentDoctor.consultationPrice : price,
                patientsPerHour: isNaN(patientsPerHour as number) ? currentDoctor.patientsPerHour : patientsPerHour,
                workingHours: workingHours as any
            }
        });

        revalidatePath("/settings");
        revalidatePath("/dashboard");
        return { success: true, data: updatedDoctor };
    } catch (error) {
        console.error("Clinic Update Error:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

/**
 * Fetches all relevant settings for the settings page.
 */
export async function getAllSettings() {
    noStore();
    try {
        const session = await getSession() as any;
        if (!session?.doctorId) return null;

        const [blockedDates, doctor] = await Promise.all([
            getBlockedDates(),
            prisma.doctor.findUnique({
                where: { id: session.doctorId },
                select: {
                    id: true,
                    name: true,
                    clinicLogo: true,
                    clinicPhone: true,
                    address: true,
                    workingHours: true,
                    consultationPrice: true,
                    patientsPerHour: true,
                    doctor_name: true,
                    specialty_title: true,
                    years_of_experience: true,
                    Maps_url: true,
                    profile_image_path: true,
                    certificates_list: true,
                    working_hours_schedule: true
                }
            })
        ]);

        if (!doctor) return null;

        return {
            blockedDates,
            doctor, // Pass the whole doctor object for the profile form
            clinicInfo: {
                name: (doctor as any).name,
                logo: (doctor as any).clinicLogo || "/logo.png",
                phone: (doctor as any).clinicPhone || "+964 7XX XXX XXXX",
                address: (doctor as any).address || "العراق، بغداد"
            },
            workingHours: ((doctor as any).workingHours as unknown as WorkingHours) || { start: 14, end: 21 },
            consultationPrice: (doctor as any).consultationPrice || 25000,
            patientsPerHour: (doctor as any).patientsPerHour || 4
        };
    } catch (error) {
        return null;
    }
}

/**
 * Quickly blocks clinic operations for a number of days.
 */
export async function blockClinicDays(dayCount: number, reason: string): Promise<ActionResponse> {
    try {
        const session = await getSession() as any;
        if (!session?.doctorId) return { success: false, error: "Unauthorized" };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + dayCount);
        endDate.setHours(23, 59, 59, 999);

        await prisma.blockedTime.create({
            data: {
                startTime: today,
                endTime: endDate,
                reason,
                doctorId: session.doctorId
            }
        });

        revalidatePaths();
        return { success: true, data: null };
    } catch (error) {
        console.error("Block Days Error:", error);
        return { success: false, error: "Failed to block clinic days" };
    }
}

function revalidatePaths() {
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/book");
}
