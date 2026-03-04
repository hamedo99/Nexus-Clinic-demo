"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, ChevronRight, ChevronLeft, User, Calendar, Phone, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Patient {
    id: string;
    fullName: string;
    phoneNumber: string;
    createdAt: Date;
    _count: {
        appointments: number;
    };
}

interface PatientsArchiveProps {
    data: {
        patients: Patient[];
        total: number;
        pages: number;
    };
    query: string;
    page: number;
}

export function PatientsArchive({ data, query, page }: PatientsArchiveProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(query);

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set("q", searchTerm);
            } else {
                params.delete("q");
            }
            params.set("page", "1"); // Reset to page 1 on search
            router.replace(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, pathname, router, searchParams]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">سجل المرضى</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة جميع ملفات المرضى المسجلين في العيادة</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Download size={18} />
                        <span className="hidden sm:inline">تصدير البيانات</span>
                    </Button>
                </div>
            </div>

            {/* Filter Card */}
            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="البحث بالاسم أو رقم الهاتف..."
                        className="pr-10 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* Table Section */}
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-sm font-bold">اسم المريض</th>
                                <th className="px-6 py-4 text-sm font-bold">رقم الهاتف</th>
                                <th className="px-6 py-4 text-sm font-bold">تاريخ التسجيل</th>
                                <th className="px-6 py-4 text-sm font-bold">إجمالي الزيارات</th>
                                <th className="px-6 py-4 text-sm font-bold text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {data.patients.length > 0 ? (
                                data.patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                                                    {patient.fullName.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                                    {patient.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium" dir="ltr">
                                                <Phone size={14} className="text-gray-400" />
                                                {patient.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                                <Calendar size={14} />
                                                {format(new Date(patient.createdAt), "dd MMM yyyy", { locale: ar })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                    {patient._count.appointments} زيارة
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <Link href={`/patients/${patient.id}`}>
                                                    <Button size="sm" variant="outline" className="text-xs font-bold hover:bg-primary hover:text-white transition-all rounded-lg h-8 border-gray-200 dark:border-gray-700">
                                                        عرض الملف
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <User size={48} className="opacity-20" />
                                            <p className="font-medium">لم يتم العثور على مرضى مسجلين</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            عرض {data.patients.length} من أصل {data.total} مريض
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="h-8 w-8 p-0 rounded-md"
                            >
                                <ChevronRight size={18} />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, data.pages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`h-8 w-8 p-0 rounded-md text-xs font-bold ${page === pageNum ? "shadow-md shadow-primary/20" : ""}`}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                {data.pages > 5 && <span className="px-1 text-gray-400">...</span>}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= data.pages}
                                className="h-8 w-8 p-0 rounded-md"
                            >
                                <ChevronLeft size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
