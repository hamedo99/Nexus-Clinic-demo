import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardStats, getDoctorList } from "@/lib/actions";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
    const session: any = await getSession();

    // Parallelize core data and supplementary doctor list
    const [data, doctors] = await Promise.all([
        getDashboardStats(undefined, session),
        session?.role === "ADMIN" ? getDoctorList() : Promise.resolve([])
    ]);

    return (
        <DashboardClient
            initialData={data}
            role={session?.role}
            userName={session?.name}
            doctorId={session?.doctorId}
            allDoctors={doctors}
        />
    );
}
