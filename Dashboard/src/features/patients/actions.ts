"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { patientService } from "./services";
import { patientSchema } from "./schemas";

export async function getPatientsAction(query: string = "") {
    noStore();
    try {
        const session = await getSession() as any;
        const doctorId = session && session.role !== "ADMIN" ? session.doctorId : undefined;
        return await patientService.getPatients(query, doctorId);
    } catch (error) {
        console.error("Patients Fetch Error:", error);
        return [];
    }
}

export async function createPatientAction(prevState: any, formData: FormData) {
    try {
        const rawData = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
        };

        // Zod Server validation
        const parsedData = patientSchema.safeParse(rawData);
        if (!parsedData.success) {
            return {
                success: false,
                message: parsedData.error.issues.map((e: any) => e.message).join(", ")
            };
        }

        const session = await getSession() as any;
        const doctorId = session?.doctorId;

        const newPatient = await patientService.createPatient(parsedData.data, doctorId);

        revalidatePath("/patients");
        return { success: true, data: newPatient };
    } catch (error) {
        console.error("Patient creation error", error);
        return { success: false, message: "فشل في تسجيل المريض. قد يكون الرقم مسجلاً مسبقاً." };
    }
}
