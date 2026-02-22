import React from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminNavbar } from "@/components/admin-navbar";
import { getSession } from "@/lib/auth";
import { NotificationProvider } from "@/components/notification-provider";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session: any = await getSession();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-gray-900" dir="rtl">
            <NotificationProvider />
            {/* Sidebar */}
            <AdminSidebar role={session?.role} />

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Global Navbar */}
                <AdminNavbar userName={session?.name} role={session?.role} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
