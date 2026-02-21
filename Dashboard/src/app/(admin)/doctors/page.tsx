import { getAllDoctors } from "@/lib/actions";
import { DoctorsClient } from "@/components/doctors-client";

export default async function DoctorsPage() {
    const doctors = await getAllDoctors();

    return <DoctorsClient doctors={doctors} />;
}
