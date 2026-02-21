import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@nexus/shared";
import { DoctorProfileForm } from "@/components/doctor-profile-form";

export default async function DoctorProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;

  // Get current doctor based on session
  let doctor = null;
  if (user.role === "DOCTOR" && user.doctorId) {
    // For doctors, get their own profile
    doctor = await prisma.doctor.findUnique({
      where: { id: user.doctorId }
    });
  } else if (user.doctorId) {
    // For secretaries, get the doctor they work for
    doctor = await prisma.doctor.findUnique({
      where: { id: user.doctorId }
    });
  }

  if (!doctor) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">الملف الشخصي للطبيب</h1>
        <p className="text-muted-foreground">
          إدارة بيانات الطبيب التي ستظهر للمرضى
        </p>
      </div>

      <DoctorProfileForm doctor={doctor} />
    </div>
  );
}
