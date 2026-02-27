import { z } from "zod";

export const patientSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
    phone: z.string().regex(/^07[\d]{9}$/, "رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 07")
});

export type PatientInput = z.infer<typeof patientSchema>;
