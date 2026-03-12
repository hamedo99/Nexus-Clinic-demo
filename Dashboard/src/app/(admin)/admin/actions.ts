"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelGlobalAppointment(id: string) {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel appointment", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

export async function manageDoctor(data: {
  id?: string;
  name: string;
  specialty: string;
  slug: string;
  theme_color?: string;
  logo_url?: string;
  isActive: boolean;
}) {
  try {
    if (data.id) {
      await prisma.doctor.update({
        where: { id: data.id },
        data: {
          name: data.name,
          specialty: data.specialty,
          theme_color: data.theme_color,
          logo_url: data.logo_url,
          isActive: data.isActive,
        } as any,
      });
    } else {
      await prisma.doctor.create({
        data: {
          name: data.name,
          specialty: data.specialty,
          slug: data.slug,
          theme_color: data.theme_color,
          logo_url: data.logo_url,
          isActive: data.isActive,
        } as any,
      });
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to manage doctor", error);
    return { success: false, error: "Failed to manage doctor" };
  }
}
