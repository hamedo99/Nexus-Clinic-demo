"use server";

import { prisma, fetchDoctorBySlug, fetchAllDoctors, fetchDoctorList } from "@nexus/shared";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { getSession } from "@/lib/auth";
import { ActionResponse, WorkingHours } from "@/lib/types";

import { unstable_cache } from "next/cache";

/**
 * Fetches a doctor by their unique slug. (Cached)
 */
export const getDoctorBySlug = unstable_cache(
    async (slug: string) => {
        return await fetchDoctorBySlug(slug);
    },
    ["doctor-by-slug"],
    { revalidate: 3600, tags: ["doctors"] }
);

/**
 * Fetches all doctors with counts for admin dashboard. (Heavy)
 */
export async function getAllDoctors() {
    noStore();
    return await fetchAllDoctors();
}

/**
 * Lightweight doctor list for dropdowns and filters. (Cached)
 */
export const getDoctorList = unstable_cache(
    async () => {
        return await fetchDoctorList();
    },
    ["doctor-list-light"],
    { revalidate: 3600, tags: ["doctors"] }
);


/**
 * Creates a new doctor and their user account.
 */
export async function createDoctor(prevState: any, formData: FormData): Promise<ActionResponse> {
    const name = formData.get("name") as string;
    const specialty = formData.get("specialty") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const subscriptionStatus = (formData.get("subscriptionStatus") || "TRIAL") as any;

    let slug = formData.get("slug") as string;
    if (!slug && name) {
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
    }

    if (!name || !specialty || !email || !password || !slug) {
        return { success: false, message: "الرجاء ملء جميع الحقول المطلوبة" };
    }

    try {
        const newDoctor = await prisma.doctor.create({
            data: { name, specialty, slug, address: address as any, subscriptionStatus }
        });

        await prisma.user.create({
            data: { email, password, name, role: "DOCTOR", doctorId: newDoctor.id } as any
        });

        revalidatePath("/doctors");
        return { success: true, data: newDoctor, message: "تم إضافة الطبيب بنجاح" };
    } catch (error) {
        console.error("Create Doctor Error:", error);
        return { success: false, error: "Failed to create doctor", message: "حدث خطأ أثناء إضافة الطبيب" };
    }
}

/**
 * Updates internal doctor settings (Admin only).
 */
export async function updateDoctor(prevState: any, formData: FormData): Promise<ActionResponse> {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const specialty = formData.get("specialty") as string;
    const slug = formData.get("slug") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const subscriptionStatus = formData.get("subscriptionStatus") as any;

    if (!id || !name || !specialty || !slug) {
        return { success: false, error: "Validation Error", message: "الرجاء ملء جميع الحقول المطلوبة" };
    }

    try {
        await prisma.doctor.update({
            where: { id },
            data: { name, specialty, slug, address: address as any, subscriptionStatus }
        });

        const user = await prisma.user.findFirst({ where: { doctorId: id } as any });
        if (user) {
            const updateData: any = { name };
            if (email?.trim()) updateData.email = email;
            if (password?.trim()) updateData.password = password;
            await prisma.user.update({ where: { id: user.id }, data: updateData });
        }

        revalidatePath("/doctors");
        return { success: true, data: null, message: "تم تحديث بيانات الطبيب بنجاح" };
    } catch (error) {
        return { success: false, error: "Failed to update doctor", message: "حدث خطأ أثناء التحديث" };
    }
}

/**
 * Updates the full doctor profile including new fields for the public profile.
 */
export async function updateFullDoctorProfile(prevState: any, formData: FormData): Promise<ActionResponse> {
    const session = await getSession() as any;
    if (!session || !session.userId) {
        return { success: false, message: "غير مصرح بالوصول" };
    }

    // Determine the effective ID: use the one from formData if ADMIN, 
    // otherwise strictly use the doctorId from the session.
    const formId = formData.get("id") as string;
    const effectiveDoctorId = session.role === 'ADMIN' ? (formId || session.doctorId) : session.doctorId;

    if (!effectiveDoctorId) {
        return { success: false, message: "خطأ في تحديد الطبيب. يرجى تسجيل الدخول مرة أخرى." };
    }

    // Fetch current doctor data to have fallback values for partial updates
    const currentDoctor = await prisma.doctor.findUnique({
        where: { id: effectiveDoctorId },
        select: {
            doctor_name: true,
            name: true,
            specialty_title: true,
            years_of_experience: true,
            Maps_url: true,
            profile_image_path: true,
            address: true,
            clinicPhone: true,
            consultationPrice: true,
            patientsPerHour: true,
            certificates_list: true,
            working_hours_schedule: true
        }
    });

    if (!currentDoctor) {
        return { success: false, message: "تعذر العثور على بيانات الطبيب" };
    }

    // Profile Fields (If value is null/empty in form, keep the current database value)
    const doctor_name = (formData.get("doctor_name") as string) || currentDoctor.doctor_name || currentDoctor.name;
    const specialty_title = (formData.get("specialty_title") as string) || currentDoctor.specialty_title;
    const yearsRaw = formData.get("years_of_experience");
    const years_of_experience = (yearsRaw && yearsRaw !== "") ? parseInt(yearsRaw as string, 10) : currentDoctor.years_of_experience;
    const Maps_url = (formData.get("Maps_url") as string) || currentDoctor.Maps_url;
    const profile_image_path = (formData.get("profile_image_path") as string) || currentDoctor.profile_image_path;

    // Clinic Fields
    const name = (formData.get("clinic_name") as string) || currentDoctor.name;
    const address = (formData.get("address") as string) || currentDoctor.address;
    const clinicPhone = (formData.get("clinicPhone") as string) || currentDoctor.clinicPhone;

    const priceRaw = formData.get("consultationPrice");
    const consultationPrice = (priceRaw && priceRaw !== "") ? parseInt(priceRaw as string, 10) : currentDoctor.consultationPrice;

    const patientsRaw = formData.get("patientsPerHour");
    const patientsPerHour = (patientsRaw && patientsRaw !== "") ? parseInt(patientsRaw as string, 10) : currentDoctor.patientsPerHour;

    // Parse certificates and schedule
    let certificates_list = [];
    try {
        const certsRaw = formData.get("certificates_list") as string;
        certificates_list = certsRaw ? JSON.parse(certsRaw) : [];
    } catch (e) {
        certificates_list = [];
    }

    let working_hours_schedule = {};
    try {
        const scheduleRaw = formData.get("working_hours_schedule") as string;
        working_hours_schedule = scheduleRaw ? JSON.parse(scheduleRaw) : {};
    } catch (e) {
        working_hours_schedule = {};
    }

    console.log("Updating Doctor ID:", effectiveDoctorId);

    try {
        // Use update instead of updateMany to get the updated object
        const updatedDoctor = await prisma.doctor.update({
            where: {
                id: effectiveDoctorId,
                // Ensure the user has permission to update this specific doctor
                ...(session.role !== 'ADMIN' ? { id: session.doctorId } : {})
            },
            data: {
                // Profile
                doctor_name,
                specialty_title,
                years_of_experience,
                Maps_url,
                profile_image_path,
                certificates_list: certificates_list as any,
                working_hours_schedule: working_hours_schedule as any,

                // Clinic settings
                name, // Clinic name
                address,
                clinicPhone,
                consultationPrice,
                patientsPerHour
            }
        });

        revalidatePath("/(admin)/settings", "page");
        revalidatePath("/(admin)/doctor-profile", "page");
        revalidatePath("/", "layout");

        return { success: true, message: "تم التحديث بنجاح", data: updatedDoctor };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { success: false, message: "حدث خطأ أثناء التحديث. تأكد من صحة البيانات وصلاحياتك." };
    }
}
