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
        <div className="flex h-screen bg-slate-50 dark:bg-gray-900 overflow-hidden" dir="rtl">
            <NotificationProvider />
            {/* Sidebar - Fixed height and not scrolling */}
            <AdminSidebar role={session?.role} />

            {/* Content Wrapper - This container now handles scrolling */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative custom-scrollbar">
                {/* Global Navbar - Sticky inside the scroll container */}
                <AdminNavbar userName={session?.name} role={session?.role} />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
