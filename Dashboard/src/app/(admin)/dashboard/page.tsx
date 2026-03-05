import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardStats, getDoctorList } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default async function DashboardPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams;
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent searchParams={searchParams} />
        </Suspense>
    );
}

async function DashboardContent({ searchParams }: { searchParams: { q?: string } }) {
    const session: any = await getSession();
    const query = searchParams?.q || '';

    try {
        // Parallelize core data and supplementary doctor list
        const [data, doctors] = await Promise.all([
            getDashboardStats(undefined, session, undefined, query),
            session?.role === "ADMIN" ? getDoctorList() : Promise.resolve([])
        ]);

        if (!data) {
            throw new Error("Data returned is undefined or null");
        }

        return (
            <DashboardClient
                initialData={data}
                role={session?.role}
                userName={session?.name}
                doctorId={session?.doctorId}
                allDoctors={doctors}
            />
        );
    } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        throw new Error("Failed to fetch dashboard data");
    }
}
