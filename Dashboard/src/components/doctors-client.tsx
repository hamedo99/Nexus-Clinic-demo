"use client";

import { EditDoctorDialog } from "@/components/edit-doctor-dialog";
import { CreateDoctorDialog } from "@/components/create-doctor-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Users, Calendar, ExternalLink, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/ui/subscription-badge";
import { memo } from "react";

interface DoctorsClientProps {
    doctors: any[];
}

const DoctorCard = memo(({ doctor }: { doctor: any }) => {
    const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/book/${doctor.slug}` : "";

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300 relative group border-primary/10 overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{doctor.name}</CardTitle>
                    <span className="text-xs font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full inline-block">
                        {doctor.specialty}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <EditDoctorDialog doctor={doctor} />
                    <SubscriptionBadge status={doctor.subscriptionStatus} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border">
                        <div className="flex items-center gap-1">
                            <CalendarDays size={14} className="text-primary/70" />
                            <span>تاريخ الانضمام:</span>
                        </div>
                        <span className="font-bold">{new Date(doctor.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col p-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50">
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mb-1">إحصائية الحصص</span>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                <span className="text-lg font-bold">{doctor._count?.appointments || 0}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5">موعد كلي</span>
                        </div>
                        <div className="flex flex-col p-3 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">قاعدة المرضى</span>
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-emerald-500" />
                                <span className="text-lg font-bold">{doctor._count?.patients || 0}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-0.5">مريض مسجل</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">رابط الحجز والمعاينة:</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-800 flex-1">
                                <code className="text-xs truncate text-left text-primary/80 font-mono" dir="ltr">
                                    /book/{doctor.slug}
                                </code>
                                <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-primary transition-colors" onClick={() => {
                                    const fullUrl = `${window.location.origin}/book/${doctor.slug}`;
                                    navigator.clipboard.writeText(fullUrl);
                                }}>
                                    <Copy size={12} />
                                </Button>
                            </div>
                            <Link href={`/book/${doctor.slug}`} target="_blank">
                                <Button size="sm" variant="outline" className="gap-2 text-xs border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all duration-300">
                                    <ExternalLink size={14} />
                                    معاينة
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

DoctorCard.displayName = "DoctorCard";

export function DoctorsClient({ doctors }: DoctorsClientProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-primary">إدارة الأطباء</h1>
                <CreateDoctorDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>

            {doctors.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-muted-foreground text-lg mb-4">لا يوجد أطباء مسجلين حالياً</p>
                    <p className="text-sm text-gray-400">ابدأ بإضافة طبيب جديد لإنشاء رابط الحجز الأول.</p>
                </div>
            )}
        </div>
    );
}
