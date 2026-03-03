import { Suspense } from "react"
import type { Metadata } from "next"
import BookingClient from "@/components/booking-client"
import BookingSkeleton from "@/components/booking/skeleton"
import { fetchDoctorBySlug } from "@/lib/shared-logic/doctors"
import { fetchBookingConfig } from "@/lib/shared-logic/bookings"
import { resolveMediaPath } from "@/lib/shared-logic/utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const revalidate = 3600; // ISR: Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const doctor = await fetchDoctorBySlug(slug);

    if (!doctor) {
        return {
            title: "طبيب غير موجود | نظام الحجوزات",
            description: "لم يتم العثور على الطبيب المطلوب.",
        }
    }

    const doctorName = doctor.doctor_name || doctor.name || "طبيب";
    const doctorTitle = doctor.specialty_title || doctor.specialty || "تخصص غير محدد";
    const title = `${doctorName} - ${doctorTitle} | احجز موعدك الآن`;
    const description = doctor.specialty_title
        ? `احجز موعدك مع ${doctorName}، أخصائي ${doctorTitle} بخبرة تتجاوز ${doctor.years_of_experience || 0} سنوات في رعاية المرضى.`
        : `احجز موعدك مع ${doctorName} في عيادتنا.`;

    // Attempt to make absolute URL if it is relative
    let defaultUrl = process.env.NEXT_PUBLIC_PATIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://nexus-clinic.com";
    let imagePath = resolveMediaPath(doctor.profile_image_path);
    let imageUrl = imagePath.startsWith("http") ? imagePath : `${defaultUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            locale: "ar_IQ",
            siteName: "عيادة نكسس",
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: doctorName,
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [imageUrl],
        },
    }
}

export async function generateStaticParams() {
    try {
        const doctors = await prisma.doctor.findMany({ select: { slug: true } });
        return doctors.map((doc) => ({
            slug: doc.slug,
        }));
    } catch (error) {
        console.error("generateStaticParams Error:", error);
        return [];
    }
}

export default async function DoctorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Parallel fetch doctor data and global configuration
    const [doctor, globalConfig] = await Promise.all([
        fetchDoctorBySlug(slug),
        fetchBookingConfig()
    ]);

    if (!doctor) {
        notFound();
    }

    // Mapping real data to the UI structure
    const DOCTOR_DATA = {
        id: doctor.id,
        nameAr: doctor.doctor_name || doctor.name || "لا يوجد اسم",
        nameEn: doctor.doctor_name_en || "Dr.",
        titleAr: doctor.specialty_title || doctor.specialty || "لا يوجد تخصص",
        bioAr: doctor.specialty_title ? `أخصائي ${doctor.specialty_title} مع خبرة تزيد عن ${doctor.years_of_experience || 0} سنوات في رعاية المرضى.` : "",
        image: resolveMediaPath(doctor.profile_image_path),
        yearsExperience: doctor.years_of_experience || 0,
        rating: 4.9,
        ratingCount: 124,
        mapsUrl: doctor.Maps_url || undefined,
        certificatesList: doctor.certificates_list ? JSON.parse(JSON.stringify(doctor.certificates_list)) : []
    }

    // Context-aware configuration: prioritize doctor settings, fallback to global
    const config = {
        workingHours: (doctor.workingHours as any) || globalConfig.workingHours,
        patientsPerHour: doctor.patientsPerHour || globalConfig.patientsPerHour,
        consultationPrice: doctor.consultationPrice || globalConfig.consultationPrice,
        slotDuration: globalConfig.slotDuration,
        clinic_locations: doctor.clinic_locations ? JSON.parse(JSON.stringify(doctor.clinic_locations)) : []
    };

    return (
        <Suspense fallback={<BookingSkeleton />}>
            <BookingClient doctor={DOCTOR_DATA} config={config} />
        </Suspense>
    )
}

