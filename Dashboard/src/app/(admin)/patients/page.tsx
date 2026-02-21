
import { PatientsClient } from "@/components/patients-client";

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

    return <PatientsClient initialQuery={query} />;
}
