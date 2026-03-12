import React from "react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardAnalytics } from "./components/dashboard-analytics";
import { GlobalAppointments } from "./components/global-appointments";
import { DoctorManagement } from "./components/doctor-management";
import { WhatsappBotMonitor } from "./components/whatsapp-bot-monitor";

export const metadata = {
  title: "لوحة تحكم النظام | Nexus Clinic",
  description: "التحليلات الشاملة، وإدارة الأطباء، وحالة النظام.",
};

export default async function SuperAdminPage() {
  const session = await getSession();

  // Role check: Only ensure ADMIN gets access to this page
  if (session?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 1. Global Analytics & System Health (The Eagle's View)
  const totalAppointmentsCount = await prisma.appointment.count();
  const totalDoctorsCount = await prisma.doctor.count();

  const activeDoctorGroup = await prisma.appointment.groupBy({
    by: ["doctorId"],
    _count: { doctorId: true },
    orderBy: { _count: { doctorId: "desc" } },
    take: 1,
  });

  let mostActiveDoctorName = "غير محدد";
  let mostActiveDoctorCount = 0;

  if (activeDoctorGroup.length > 0 && activeDoctorGroup[0].doctorId) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: activeDoctorGroup[0].doctorId },
      select: { name: true },
    });
    mostActiveDoctorName = doctor?.name || "طبيب غير معروف";
    mostActiveDoctorCount = activeDoctorGroup[0]._count.doctorId;
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             <span className="text-4xl">🚀</span> مركز القيادة والإشراف (Super Admin)
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            مراقبة حالة النظام، الاستقرارية، والأنظمة المدمجة لحظياً عبر المنصة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Analytics Section */}
          <section>
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              📊 التحليلات المركزية الشاملة
            </h2>
            <DashboardAnalytics
              totalAppointments={totalAppointmentsCount}
              totalDoctors={totalDoctorsCount}
              mostActiveDoctorName={mostActiveDoctorName}
              mostActiveDoctorCount={mostActiveDoctorCount}
            />
          </section>
        </div>

        {/* Sidebar / Integrations section */}
        <div className="lg:col-span-1 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              🤖 ربط الأنظمة والمراسلة
            </h2>
            <WhatsappBotMonitor />
          </section>
        </div>
      </div>
    </div>
  );
}
