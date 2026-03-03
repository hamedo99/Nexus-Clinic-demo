import { UpcomingAppointmentsClient } from "@/components/upcoming-appointments-client";
import { getUpcomingAppointments } from "@/lib/actions/dashboard";

export default async function CalendarPage() {
    const data = await getUpcomingAppointments();
    return <UpcomingAppointmentsClient initialData={data} />;
}
