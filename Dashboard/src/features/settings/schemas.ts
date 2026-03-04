import { z } from "zod";

export const blockedDateSchema = z.object({
    from: z.date(),
    to: z.date().optional(),
    reason: z.string().nonempty("السبب مطلوب")
});

export const blockDaysSchema = z.object({
    dayCount: z.number().min(1),
    reason: z.string().nonempty("السبب مطلوب")
});

export const updateDoctorClinicSettingsSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional(),
    price: z.number().optional(),
    patientsPerHour: z.number().optional(),
    startHour: z.number().min(0).max(23).optional(),
    endHour: z.number().min(0).max(23).optional(),
});
