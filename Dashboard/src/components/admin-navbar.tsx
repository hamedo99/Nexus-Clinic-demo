"use client";

import React from "react";
import { User, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminNavbar({ userName, role }: { userName?: string; role?: string }) {
    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="البحث عن مرضى، مواعيد..."
                        className="pl-10 bg-gray-50 border-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-primary transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                </Button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{userName || "المستخدم"}</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{role === "ADMIN" ? "المدير" : "طبيب"}</span>
                    </div>
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold border-2 border-primary/20">
                        {userName?.charAt(0) || <User size={18} />}
                    </div>
                </div>
            </div>
        </header>
    );
}
