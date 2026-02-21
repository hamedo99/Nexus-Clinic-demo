"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { ActionResponse } from "@/lib/types";

/**
 * Searches and fetches patients based on query and doctor ownership.
 */
export async function getPatients(query: string = "") {
    noStore();
    try {
        const session = await getSession() as any;
        const doctorFilter = (session && session.role !== "ADMIN") ? { doctorId: session.doctorId } : {};

        return await prisma.patient.findMany({
            where: {
                ...doctorFilter,
                OR: [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { phoneNumber: { contains: query } },
                ],
            },
            include: {
                appointments: {
                    where: doctorFilter,
                    orderBy: { startTime: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });
    } catch (error) {
        console.error("Patients Fetch Error:", error);
        return [];
    }
}

/**
 * Manual patient creation from admin/secretary panel.
 */
export async function createPatient(prevState: any, formData: FormData): Promise<ActionResponse> {
    try {
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const session = await getSession() as any;

        if (!name || !phone) return { success: false, message: "Required fields missing" };

        const patient = await prisma.patient.create({
            data: {
                fullName: name,
                phoneNumber: phone,
                doctorId: session?.doctorId // Assign to current doctor if exists
            }
        });

        revalidatePath("/patients");
        return { success: true, data: patient };
    } catch (error) {
        return { success: false, message: "فشل في تسجيل المريض. قد يكون الرقم مسجلاً مسبقاً." };
    }
}
