"use server";

import { prisma } from "@nexus/shared";
import { createSession, logout } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { doctor: true }
        } as any);

        if (!user) {
            return { error: "بيانات الدخول غير صحيحة" };
        }

        // Type casting to bypass potential valid-but-complaining linter for now if types are stale
        const userWithPassword = user as any;

        let isValid = false;
        // Check plain text "password123" (legacy/default)
        if (userWithPassword.password && !userWithPassword.password.includes(":")) {
            if (userWithPassword.password === password) {
                isValid = true;
            }
        } else {
            isValid = await verifyPassword(password, userWithPassword.password);
        }

        if (!isValid) {
            return { error: "بيانات الدخول غير صحيحة" };
        }

        if (userWithPassword.role === "SECRETARY" && userWithPassword.doctor) {
            const status = userWithPassword.doctor.subscriptionStatus;
            if (status === "EXPIRED" || status === "DISABLED") {
                return { error: "لا يمكن الدخول. اشتراك العيادة منتهي بانتظار التجديد أو معطل." };
            }
        }

        console.log("Login Successful. Role:", userWithPassword.role);

        // Create Session
        await createSession({
            userId: userWithPassword.id,
            email: userWithPassword.email,
            role: userWithPassword.role, // Ensure this is definitely from DB
            doctorId: userWithPassword.doctorId,
            name: userWithPassword.name
        });

    } catch (error) {
        console.error("Login Check Error:", error);
        return { error: "حدث خطأ في النظام" };
    }

    redirect("/dashboard");
}

export async function logoutAction() {
    await logout();
    redirect("/login");
}
