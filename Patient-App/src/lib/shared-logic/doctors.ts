import { prisma } from "../prisma";

/**
 * Fetches a doctor by their unique slug.
 */
export async function fetchDoctorBySlug(slug: string) {
    try {
        return await prisma.doctor.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                specialty: true,
                slug: true,
                address: true,
                clinicLogo: true,
                clinicPhone: true,
                workingHours: true,
                consultationPrice: true,
                doctor_name: true,
                doctor_name_en: true,
                specialty_title: true,
                years_of_experience: true,
                Maps_url: true,
                profile_image_path: true,
                certificates_list: true,
                working_hours_schedule: true,
                patientsPerHour: true,
                clinic_locations: true
            }
        });
    } catch (error) {
        console.error("fetchDoctorBySlug Error:", error);
        return null;
    }
}

/**
 * Fetches all doctors with counts.
 */
export async function fetchAllDoctors() {
    try {
        return await prisma.doctor.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { appointments: true, patients: true }
                }
            }
        });
    } catch (error) {
        console.error("fetchAllDoctors Error:", error);
        return [];
    }
}

/**
 * Lightweight doctor list for dropdowns.
 */
export async function fetchDoctorList() {
    try {
        return await prisma.doctor.findMany({
            select: { id: true, name: true, workingHours: true },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("fetchDoctorList Error:", error);
        return [];
    }
}
