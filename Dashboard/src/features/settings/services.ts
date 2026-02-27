import { prisma } from "@/lib/db";
import { WorkingHours } from "@/lib/types";

export const settingsService = {
    async addBlockedDate(doctorId: string, from: Date, to: Date, reason: string) {
        const startTime = new Date(from);
        startTime.setHours(0, 0, 0, 0);
        const endTime = new Date(to || from);
        endTime.setHours(23, 59, 59, 999);

        return await prisma.blockedTime.create({
            data: { startTime, endTime, reason, doctorId },
        });
    },

    async deleteBlockedDate(id: string, doctorId: string, isAdmin: boolean) {
        return await prisma.blockedTime.delete({
            where: {
                id,
                ...(!isAdmin ? { doctorId } : {})
            }
        });
    },

    async getBlockedDates(doctorId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return await prisma.blockedTime.findMany({
            where: { doctorId, endTime: { gte: today } },
            orderBy: { startTime: 'asc' }
        });
    },

    async updateDoctorClinicSettings(doctorId: string, updates: any) {
        const currentDoctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
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

        if (!currentDoctor) throw new Error("Doctor not found");

        const currentWorkingHours = (currentDoctor.workingHours as any) || { start: 14, end: 21 };

        return await prisma.doctor.update({
            where: { id: doctorId },
            data: {
                name: updates.name ?? currentDoctor.name,
                clinicPhone: updates.phone ?? currentDoctor.clinicPhone,
                address: updates.address ?? currentDoctor.address,
                clinicLogo: updates.logo ?? currentDoctor.clinicLogo,
                consultationPrice: updates.price ?? currentDoctor.consultationPrice,
                patientsPerHour: updates.patientsPerHour ?? currentDoctor.patientsPerHour,
                workingHours: {
                    start: updates.startHour ?? currentWorkingHours.start,
                    end: updates.endHour ?? currentWorkingHours.end
                }
            }
        });
    },

    async getDoctorSettings(doctorId: string) {
        const [blockedDates, doctor] = await Promise.all([
            this.getBlockedDates(doctorId),
            prisma.doctor.findUnique({
                where: { id: doctorId },
                select: {
                    id: true, name: true, clinicLogo: true, clinicPhone: true, address: true,
                    workingHours: true, consultationPrice: true, patientsPerHour: true
                }
            })
        ]);

        if (!doctor) return null;

        return {
            blockedDates,
            doctor,
            clinicInfo: {
                name: doctor.name,
                logo: doctor.clinicLogo || "/logo.png",
                phone: doctor.clinicPhone || "+964 7XX XXX XXXX",
                address: doctor.address || "العراق، بغداد"
            },
            workingHours: (doctor.workingHours as unknown as WorkingHours) || { start: 14, end: 21 },
            consultationPrice: doctor.consultationPrice || 25000,
            patientsPerHour: doctor.patientsPerHour || 4
        };
    }
};
