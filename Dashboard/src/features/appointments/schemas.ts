import { z } from "zod";

export const appointmentSchema = z.object({
    name: z.string().min(2, "الاسم مطلوب"),
    phone: z.string().regex(/^07[\d]{9}$/, "رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 07"),
    date: z.string().nonempty("التاريخ مطلوب"),
    time: z.string().nonempty("الوقت مطلوب"),
    doctorId: z.string().uuid("معرف الطبيب غير صالح")
});

export const updateStatusSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(["CONFIRMED", "CANCELLED", "PENDING", "COMPLETED", "NO_SHOW", "IN_PROGRESS", "ARRIVED"])
});

export const rescheduleSchema = z.object({
    id: z.string().uuid(),
    dateStr: z.string(),
    timeStr: z.string()
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
