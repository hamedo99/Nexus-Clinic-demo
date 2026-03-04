"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllSettings } from "@/lib/actions";
import { Ban, ShieldCheck, Settings } from "lucide-react";
import { BlockedDateManager } from "@/components/blocked-dates-manager";
import { DoctorProfileForm } from "@/components/doctor-profile-form";
import { useCachedData } from "@/hooks/use-cached-data";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function SettingsClient({ role }: { role?: string }) {
    const router = useRouter();
    const fetcher = useCallback(() => getAllSettings(), []);
    const { data: settings, loading, refresh } = useCachedData("settings_all", fetcher);

    if (loading && !settings) {
        return (
            <div className="space-y-8 max-w-7xl mx-auto p-1 h-full overflow-y-auto custom-scrollbar flex items-center justify-center" dir="rtl">
                <div className="text-center text-muted-foreground animate-pulse">
                    <Settings className="h-12 w-12 mb-4 mx-auto animate-spin" />
                    <p>جاري تحميل الإعدادات...</p>
                </div>
            </div>
        );
    }

    const data = settings || { blockedDates: [], doctor: {} };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-1 h-full overflow-y-auto custom-scrollbar pb-20" dir="rtl">
            <div className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-teal-800 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-teal-600" />
                    الإعدادات والملف الشخصي
                </h1>
                <p className="text-muted-foreground text-lg">
                    إدارة إعدادات العيادة، أوقات العمل، والملف الشخصي للطبيب في مكان واحد.
                </p>
            </div>

            {/* Unified Settings & Profile Form */}
            <DoctorProfileForm
                key={(data as any).doctor?.id + String((data as any).doctor?.updatedAt)}
                doctor={(data as any).doctor}
                onUpdate={() => {
                    refresh();
                    router.refresh();
                }}
            />

            <div className="grid gap-6 md:grid-cols-2 mt-8">
                {/* Security / System */}
                <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10 h-full shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            <CardTitle className="text-amber-900 dark:text-amber-100">الأمان والصلاحيات</CardTitle>
                        </div>
                        <CardDescription className="text-amber-700/80 dark:text-amber-300/80">إدارة الحساب ودخول النظام</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-amber-200/50 rounded-lg bg-white/50 dark:bg-black/20">
                                <span className="font-medium text-amber-900 dark:text-amber-100">المستخدم الحالي</span>
                                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                                    {role === "ADMIN" ? "مدير النظام" : role === "SECRETARY" ? "سكرتير" : "طبيب"}
                                </span>
                            </div>
                            <div className="text-xs text-amber-800/80 dark:text-amber-200/80 p-3 rounded-lg bg-amber-100/50 border border-amber-200/50 flex items-start gap-2">
                                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>للأغراض الأمنية، يرجى الاتصال بمسؤول النظام لتعديل صلاحيات الوصول أو تغيير كلمات المرور الحساسة.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Blocked Dates (Only for Secretary/Doctor) */}
                {role !== "ADMIN" && (
                    <Card className="border-red-200/50 bg-red-50/30 dark:bg-red-900/10 h-full shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-red-900 dark:text-red-100">سجل الإغلاقات</CardTitle>
                            </div>
                            <CardDescription className="text-red-700/80 dark:text-red-300/80">فترات إغلاق العيادة المجدولة (الإجازات والعطل)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BlockedDateManager initialData={data.blockedDates} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
