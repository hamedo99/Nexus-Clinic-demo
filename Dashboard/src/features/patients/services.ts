import { prisma } from "@/lib/db";
import { PatientInput } from "./schemas";

export const patientService = {
    async getPatients(query: string = "", doctorId?: string) {
        const doctorFilter = doctorId ? { doctorId } : {};

        return await prisma.patient.findMany({
            where: {
                ...doctorFilter,
                OR: [
                    { fullName: { contains: query, mode: "insensitive" } },
                    { phoneNumber: { contains: query } },
                ],
            },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                createdAt: true,
                appointments: {
                    where: doctorFilter,
                    select: { id: true, startTime: true, status: true },
                    orderBy: { startTime: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50
        });
    },

    async createPatient(data: PatientInput, doctorId?: string) {
        return await prisma.patient.create({
            data: {
                fullName: data.name,
                phoneNumber: data.phone,
                doctorId: doctorId
            }
        });
    }
};
