import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_PATIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://nexus-clinic.com";

    // Static routes
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ]

    try {
        // Fetch all doctors from the database
        const doctors = await prisma.doctor.findMany({
            select: {
                slug: true,
                updatedAt: true
            }
        });

        const doctorRoutes: MetadataRoute.Sitemap = doctors
            .filter((doctor: any) => doctor.slug) // Ensure slug exists
            .map((doctor: any) => ({
                url: `${baseUrl}/doctors/${doctor.slug}`,
                lastModified: doctor.updatedAt || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));

        return [...routes, ...doctorRoutes];
    } catch (error) {
        console.error("Error fetching doctors for sitemap:", error);
        // Guard for build-time errors: Return static routes if DB connection fails
        return routes;
    }
}
