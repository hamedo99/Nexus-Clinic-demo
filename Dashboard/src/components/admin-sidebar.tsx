"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AdminSidebar({ role }: { role?: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden md:flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <Link href="/dashboard" className="group block" prefetch={true}>
                    <h1 className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">NexusClinic</h1>
                    <p className="text-xs text-muted-foreground mt-1">نظام إدارة العيادة</p>
                </Link>
                {role && <span className="text-[10px] uppercase font-bold text-gray-400">{role}</span>}
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" active={pathname === "/dashboard"} prefetch={true} />

                {role === "ADMIN" && (
                    <NavLink href="/doctors" icon={<Users size={20} className="text-blue-600" />} label="إدارة الأطباء" active={pathname === "/doctors"} prefetch={true} />
                )}

                <NavLink href="/patients" icon={<Users size={20} />} label="سجل المرضى" active={pathname === "/patients"} prefetch={true} />
                <NavLink href="/calendar" icon={<Calendar size={20} />} label="التقويم" active={pathname === "/calendar"} prefetch={true} />
                <NavLink href="/settings" icon={<Settings size={20} />} label="الإعدادات" active={pathname === "/settings"} prefetch={true} />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form action={logoutAction}>
                    <button
                        className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full p-2 rounded-md transition-colors cursor-pointer"
                        type="submit"
                    >
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label, active = false, prefetch = true }: { href: string; icon: React.ReactNode; label: string; active?: boolean; prefetch?: boolean }) {
    return (
        <Link
            href={href}
            prefetch={prefetch}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active
                ? "bg-primary/10 text-primary font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
