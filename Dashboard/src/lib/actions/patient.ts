"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { ActionResponse } from "@/lib/types";

async function getDoctorFilterAndSession() {
    const session = await getSession() as any;
    const doctorFilter = (session && session.role !== "ADMIN" && session.doctorId) ? { doctorId: session.doctorId } : {};
    return { session, doctorFilter };
}

/**
 * Searches and fetches patients based on query and doctor ownership.
 */
export async function getPatients(query: string = "", page: number = 1, limit: number = 10) {
    noStore();
    try {
        const { doctorFilter } = await getDoctorFilterAndSession();

        const where: any = {
            ...doctorFilter,
            appointments: {
                some: {
                    status: { in: ["CONFIRMED", "COMPLETED"] }
                }
            }
        };

        if (query) {
            where.OR = [
                { fullName: { contains: query, mode: "insensitive" as any } },
                { phoneNumber: { contains: query } },
            ];
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                select: {
                    id: true,
                    fullName: true,
                    phoneNumber: true,
                    createdAt: true,
                    _count: {
                        select: { appointments: { where: doctorFilter } }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.patient.count({ where })
        ]);

        return {
            patients,
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error("Patients Fetch Error:", error);
        return { patients: [], total: 0, pages: 0 };
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

/**
 * Fetch a specific patient by ID along with their appointment history.
 */
export async function getPatientById(id: string) {
    noStore();
    try {
        const { session, doctorFilter } = await getDoctorFilterAndSession();

        const patient = await prisma.patient.findUnique({
            where: { id },
            include: {
                appointments: {
                    where: doctorFilter,
                    include: {
                        doctor: { select: { name: true, specialty: true } }
                    },
                    orderBy: { startTime: 'desc' }
                },
                _count: {
                    select: { appointments: { where: doctorFilter } }
                }
            }
        });

        if (!patient) return null;

        // Ensure authorization
        if (session.role !== "ADMIN" && patient.doctorId && patient.doctorId !== session.doctorId) {
            return null; // Don't leak patients from other doctors if assigned explicitly
        }

        return patient;
    } catch (error) {
        console.error("Patient Fetch Error:", error);
        return null;
    }
}
