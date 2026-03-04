import React from "react";
import { getPatientById } from "@/lib/actions/patient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, Phone, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewAppointmentButton } from "@/components/new-appointment-button";
import { getDoctorList } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patient = await getPatientById(id);
    if (!patient) return { title: "المريض غير موجود" };
    return { title: `${patient.fullName} | ملف المريض` };
}

export default async function PatientProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [patient, session, doctors] = await Promise.all([
        getPatientById(id),
        getSession(),
        getDoctorList()
    ]);

    if (!patient) {
        return notFound();
    }

    const { role, doctorId } = session as any;
    const lastVisit = patient.appointments.length > 0 ? patient.appointments[0].startTime : null;

    // Separate future vs past appointments based on current time
    const now = new Date();
    const upcomingAppointments = patient.appointments.filter(a => new Date(a.startTime) >= now);
    const pastAppointments = patient.appointments.filter(a => new Date(a.startTime) < now);

    return (
        <div className="max-w-6xl mx-auto space-y-8" dir="rtl">
            {/* Top Navigation */}
            <div>
                <Link href="/patients">
                    <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2 -ml-2 mb-2 p-2">
                        <ArrowRight size={18} />
                        <span className="font-bold">عودة إلى سجل المرضى</span>
                    </Button>
                </Link>
            </div>

            {/* Main Header Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 w-full relative overflow-hidden group">
                {/* Decorative background circle */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center gap-5 z-10">
                    <div className="h-16 w-16 md:h-20 md:w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-2xl md:text-3xl border-4 border-white dark:border-gray-800 shadow-sm">
                        {patient.fullName.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            {patient.fullName}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-500 font-medium font-mono" dir="ltr">
                            <Phone size={16} />
                            <span>{patient.phoneNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="z-10 w-full md:w-auto flex justify-end">
                    <NewAppointmentButton
                        allDoctors={doctors}
                        role={role}
                        doctorId={doctorId}
                        customTrigger={
                            <Button className="w-full md:w-auto shadow-md hover:shadow-lg transition-all rounded-xl bg-primary hover:bg-primary/95 text-white flex gap-2 items-center px-6 py-2.5 font-bold">
                                <span>➕ حجز موعد جديد</span>
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                {/* Left Column: Summary & Overview (1/3) */}
                <div className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FileText size={18} className="text-primary" />
                            ملخص المريض
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                                <span className="text-sm text-gray-500 dark:text-gray-400">تاريخ التسجيل</span>
                                <span className="font-bold text-sm">{format(new Date(patient.createdAt), "dd MMM yyyy", { locale: ar })}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                                <span className="text-sm text-gray-500 dark:text-gray-400">إجمالي الزيارات</span>
                                <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">{patient._count.appointments}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">آخر زيارة</span>
                                <span className="font-bold text-sm text-left" dir="ltr">
                                    {lastVisit ? format(new Date(lastVisit), "dd MMM yyyy", { locale: ar }) : "لا يوجد"}
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full rounded-xl border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
                            ✏️ تعديل البيانات
                        </Button>
                    </Card>
                </div>

                {/* Right Column: Timeline (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 relative min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                <CalendarIcon className="text-primary" />
                                سجل المواعيد
                            </h2>
                        </div>

                        {patient.appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4 text-center">
                                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                                    <Clock size={32} className="opacity-50" />
                                </div>
                                <p className="font-medium text-lg">لم يقم هذا المريض بحجز أي موعد حتى الآن.</p>
                                <p className="text-sm opacity-70">ابدأ بحجز أول موعد له عبر الزر في الأعلى.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Upcoming */}
                                {upcomingAppointments.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 inline-block px-3 py-1 rounded-md">المواعيد القادمة</h3>
                                        <div className="space-y-3">
                                            {upcomingAppointments.map((apt) => (
                                                <AppointmentRow key={apt.id} appointment={apt} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Past */}
                                {pastAppointments.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 inline-block px-3 py-1 rounded-md">المواعيد السابقة</h3>
                                        <div className="space-y-3">
                                            {pastAppointments.map((apt) => (
                                                <div key={apt.id} className="opacity-80 hover:opacity-100 transition-opacity">
                                                    <AppointmentRow appointment={apt} past />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

            </div>
        </div>
    );
}

function AppointmentRow({ appointment, past = false }: { appointment: any, past?: boolean }) {
    const isConfirmed = appointment.status === "CONFIRMED";
    const isCancelled = appointment.status === "CANCELLED";
    const statusLabel = isConfirmed ? "مؤكد" : isCancelled ? "ملغي" : "بانتظار التأكيد";
    const statusClasses = isConfirmed ? "bg-emerald-50 text-emerald-600 border-emerald-200"
        : isCancelled ? "bg-red-50 text-red-600 border-red-200"
            : "bg-orange-50 text-orange-600 border-orange-200";

    return (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-900/50 ${past ? 'border-gray-100 dark:border-gray-800' : 'border-gray-200 dark:border-gray-700 shadow-sm'}`}>
            <div className="flex items-center gap-4 w-full">
                <div className={`shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold ${past ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-primary/10 text-primary'}`}>
                    <span className="text-sm">{format(new Date(appointment.startTime), "dd")}</span>
                    <span className="text-[10px]">{format(new Date(appointment.startTime), "MMM", { locale: ar })}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                        {format(new Date(appointment.startTime), "EEEE", { locale: ar })}
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 rounded-md" dir="ltr">
                            {format(new Date(appointment.startTime), "hh:mm a")}
                        </span>
                    </h4>
                    {appointment.doctor?.name && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                            مع د. {appointment.doctor.name}
                        </p>
                    )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${statusClasses}`}>
                        {statusLabel}
                    </span>
                    {!past && appointment.status !== "CANCELLED" && (
                        <span className="text-[10px] text-primary font-medium hover:underline cursor-pointer">تفاصيل</span>
                    )}
                </div>
            </div>
        </div>
    );
}
