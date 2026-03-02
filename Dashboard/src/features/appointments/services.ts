import { prisma } from "@/lib/db";
import { validateAndCreateBooking } from "@/lib/shared-logic/bookings";
import { AppointmentInput } from "./schemas";

export const appointmentService = {
    async createBooking(data: AppointmentInput) {
        const startTime = new Date(data.date);
        const [hours, minutes] = data.time.split(":").map(Number);
        startTime.setHours(hours, minutes, 0, 0);

        return await validateAndCreateBooking({
            patientName: data.name,
            patientPhone: data.phone,
            startTime,
            doctorId: data.doctorId
        });
    },

    async updateAppointmentStatus(id: string, status: any) {
        return await prisma.appointment.update({
            where: { id },
            data: { status }
        });
    },

    async rescheduleAppointment(id: string, dateStr: string, timeStr: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            select: { doctorId: true }
        });

        if (!appointment?.doctorId) throw new Error("Appointment not found");

        const startTime = new Date(dateStr);
        const [hours, minutes] = timeStr.split(":").map(Number);
        startTime.setHours(hours, minutes, 0, 0);

        return await prisma.appointment.update({
            where: { id },
            data: { startTime, status: "PENDING" }
        });
    }
};
