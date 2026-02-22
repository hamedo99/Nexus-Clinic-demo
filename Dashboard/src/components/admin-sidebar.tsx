"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function SidebarContent({ role, onNavItemClick }: { role?: string; onNavItemClick?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <Link href="/dashboard" className="group block" onClick={onNavItemClick}>
                    <h1 className="text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors">NexusClinic</h1>
                    <p className="text-xs text-muted-foreground mt-1">نظام إدارة العيادة</p>
                </Link>
                {role && <span className="text-[10px] uppercase font-bold text-gray-400">{role}</span>}
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="لوحة التحكم" active={pathname === "/dashboard"} onClick={onNavItemClick} />

                {role === "ADMIN" && (
                    <NavLink href="/doctors" icon={<Users size={20} className="text-blue-600" />} label="إدارة الأطباء" active={pathname === "/doctors"} onClick={onNavItemClick} />
                )}

                <NavLink href="/patients" icon={<Users size={20} />} label="سجل المرضى" active={pathname === "/patients"} onClick={onNavItemClick} />
                <NavLink href="/calendar" icon={<Calendar size={20} />} label="التقويم" active={pathname === "/calendar"} onClick={onNavItemClick} />
                <NavLink href="/settings" icon={<Settings size={20} />} label="الإعدادات" active={pathname === "/settings"} onClick={onNavItemClick} />
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
        </div>
    );
}

export function AdminSidebar({ role }: { role?: string }) {
    return (
        <aside className="w-64 border-l border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-full bg-white dark:bg-gray-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300 relative">
            <SidebarContent role={role} />
        </aside>
    );
}

function NavLink({ href, icon, label, active = false, prefetch = true, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; prefetch?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            prefetch={prefetch}
            onClick={onClick}
            className={`flex items-center gap-3 p-3 rounded-l-lg transition-all duration-200 ${active
                ? "bg-teal-50 text-teal-700 font-bold border-r-4 border-teal-600 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-500 shadow-sm"
                : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 border-r-4 border-transparent hover:border-slate-200 dark:hover:bg-gray-700 dark:hover:border-gray-600 font-medium"
                }`}
        >
            <div className={`${active ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-gray-400"}`}>
                {icon}
            </div>
            <span>{label}</span>
        </Link>
    );
}
