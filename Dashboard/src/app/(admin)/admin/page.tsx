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

  // 2. System-Wide Upcoming Appointments
  const globalAppointmentsRaw = await prisma.appointment.findMany({
    where: {
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    include: { doctor: { select: { name: true } } },
    take: 100,
  });

  const globalAppointments = globalAppointmentsRaw.map((app) => ({
    id: app.id,
    startTime: app.startTime,
    status: app.status,
    doctorName: app.doctor?.name || "طبيب غير معروف",
  }));

  // 3. Doctor Onboarding & Management
  const doctorsRaw = await prisma.doctor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      specialty: true,
      clinicPhone: true,
      theme_color: true,
      logo_url: true,
      isActive: true,
    } as any,
  });

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            لوحة تحكم النظام (المدير العام)
          </h1>
          <p className="text-muted-foreground mt-2">
            مراقبة حالة النظام وإدارة انضمام الأطباء والإشراف على العمليات الشاملة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Analytics Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">لوحة حالة النظام</h2>
            <DashboardAnalytics
              totalAppointments={totalAppointmentsCount}
              mostActiveDoctorName={mostActiveDoctorName}
              mostActiveDoctorCount={mostActiveDoctorCount}
            />
          </section>

          {/* Clinics / Doctors Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 mt-8 text-slate-800 dark:text-slate-200">إعداد الأطباء والعيادات</h2>
            <DoctorManagement doctors={doctorsRaw as any} />
          </section>

          {/* Appointments Control Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 mt-8 text-slate-800 dark:text-slate-200">التحكم في المواعيد القادمة</h2>
            <GlobalAppointments appointments={globalAppointments} />
          </section>
        </div>

        {/* Sidebar / Integrations section */}
        <div className="lg:col-span-1 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">الربط (التكاملات)</h2>
            <WhatsappBotMonitor />
          </section>
        </div>
      </div>
    </div>
  );
}
