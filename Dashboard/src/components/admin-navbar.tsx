"use client";

import React from "react";
import { User, Bell, Search, Menu, CheckCircle2, Calendar, Clock, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/admin-sidebar";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AdminNavbar({ userName, role }: { userName?: string; role?: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const notifications = useDashboardStore(state => state.notifications);
    const markAsRead = useDashboardStore(state => state.markAsRead);
    const clearNotifications = useDashboardStore(state => state.clearNotifications);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const notificationRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set("q", searchTerm);
            } else {
                params.delete("q");
            }
            // Only replace if the parameter actually changed to avoid infinite loops
            if (searchParams.get("q") !== params.get("q")) {
                router.replace(`${pathname}?${params.toString()}`);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, pathname, router, searchParams]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };

        if (isNotificationsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNotificationsOpen]);

    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 w-full">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Menu size={24} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 w-72 border-r-0">
                            <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                            <SidebarContent role={role} onNavItemClick={() => setIsMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>
                {!pathname.includes('/settings') && (
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="البحث عن مرضى، مواعيد..."
                            className="pl-10 bg-gray-50 dark:bg-gray-900/50 border-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative text-gray-500 hover:text-primary transition-colors",
                            isNotificationsOpen && "bg-gray-100 dark:bg-gray-700"
                        )}
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                    </Button>

                    {isNotificationsOpen && (
                        <div className="absolute left-0 mt-2 w-72 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-4 z-50 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-50 dark:border-gray-700">
                                <h3 className="font-bold text-sm">الإشعارات</h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={clearNotifications}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="flex flex-col">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer relative",
                                                    !n.read && "bg-primary/[0.02]"
                                                )}
                                                onClick={() => markAsRead(n.id)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                                                        n.type === 'appointment' ? "bg-blue-100 text-blue-600" :
                                                            n.type === 'reminder' ? "bg-amber-100 text-amber-600" :
                                                                n.type === 'success' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {n.type === 'appointment' ? <Calendar size={18} /> :
                                                            n.type === 'reminder' ? <Clock size={18} /> :
                                                                n.type === 'success' ? <Sparkles size={18} /> : <Bell size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{n.title}</h4>
                                                            <span className="text-[10px] text-gray-400">
                                                                {formatDistanceToNow(new Date(n.time), { addSuffix: true, locale: ar })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                    {!n.read && (
                                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-12 w-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-3">
                                            <CheckCircle2 className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">لا توجد إشعارات حالياً</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="px-4 pt-3 mt-2 border-t border-gray-50 dark:border-gray-700">
                                    <Button variant="link" className="w-full text-[11px] h-auto p-0 text-primary font-bold" onClick={() => notifications.forEach(n => markAsRead(n.id))}>
                                        تحديد الكل كمقروء
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-0.5 md:mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-2 md:gap-3 p-1 pr-1 md:pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer group max-w-[150px] md:max-w-none">
                    <div className="flex flex-col items-end hidden sm:flex overflow-hidden">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate w-full group-hover:text-primary">
                            {userName || "المستخدم"}
                        </span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                            {role === "ADMIN" ? "المدير" : "الاستقبال"}
                        </span>
                    </div>
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold border-2 border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        {userName?.charAt(0) || <User size={18} />}
                    </div>
                </div>
            </div>
        </header>
    );
}
