import BookingClient from "@/components/booking-client"
import { fetchDoctorBySlug } from "@/lib/shared-logic/doctors"
import { fetchBookingConfig } from "@/lib/shared-logic/bookings"
import { resolveMediaPath } from "@/lib/shared-logic/utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const revalidate = 3600;

export async function generateStaticParams() {
    const doctors = await prisma.doctor.findMany({ select: { slug: true } });
    return doctors.map((doc) => ({
        slug: doc.slug,
    }));
}

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch dynamic doctor data
    const doctor = await fetchDoctorBySlug(slug);

    if (!doctor) {
        notFound();
    }

    const DOCTOR_DATA = {
        id: doctor.id,
        nameAr: doctor.doctor_name || doctor.name || "لا يوجد اسم",
        titleAr: doctor.specialty_title || doctor.specialty || "لا يوجد تخصص",
        bioAr: doctor.specialty_title ? `أخصائي ${doctor.specialty_title} مع خبرة تزيد عن ${doctor.years_of_experience || 0} سنوات في رعاية المرضى.` : "",
        image: resolveMediaPath(doctor.profile_image_path),
        yearsExperience: doctor.years_of_experience || 0,
        rating: 4.9,
        ratingCount: 124,
        mapsUrl: doctor.Maps_url || undefined,
        certificatesList: doctor.certificates_list ? JSON.parse(JSON.stringify(doctor.certificates_list)) : []
    }

    // Fetch dynamic configuration from shared logic
    const globalConfig = await fetchBookingConfig();
    const config = {
        workingHours: (doctor.workingHours as any) || globalConfig.workingHours,
        patientsPerHour: doctor.patientsPerHour || globalConfig.patientsPerHour,
        consultationPrice: doctor.consultationPrice || globalConfig.consultationPrice,
        slotDuration: globalConfig.slotDuration
    };

    // Pass the real doctor data and config to Client Component
    return <BookingClient doctor={DOCTOR_DATA} config={config} />
}
