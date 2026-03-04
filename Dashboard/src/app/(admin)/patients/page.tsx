import React from "react";
import { getPatients } from "@/lib/actions/patient";
import { PatientsArchive } from "@/components/patients-archive";
import { Metadata } from "next";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
    title: "سجل المرضى | NexusClinic",
    description: "إدارة سجلات وملفات المرضى",
};

export default async function PatientsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;

    return (
        <Suspense fallback={<PatientsLoading />}>
            <PatientsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function PatientsContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const query = typeof searchParams.q === "string" ? searchParams.q : "";
    const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;

    // Fetch patients with pagination and search
    const data = await getPatients(query, page, 10);

    return (
        <div className="max-w-6xl mx-auto py-2">
            <PatientsArchive
                data={data}
                query={query}
                page={page}
            />
        </div>
    );
}

function PatientsLoading() {
    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col gap-6">
                <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
                <Card className="p-12 flex flex-col items-center justify-center border-dashed border-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="mt-4 text-sm text-muted-foreground font-medium">جاري تحميل سجل المرضى...</p>
                </Card>
            </div>
        </div>
    );
}
