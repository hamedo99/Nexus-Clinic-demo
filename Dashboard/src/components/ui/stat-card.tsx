"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { memo } from "react";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    gradient?: string;
    iconBg?: string;
}

export const StatCard = memo(function StatCard({ title, value, description, icon, gradient, iconBg }: StatCardProps) {
    return (
        <Card className={`bg-white dark:bg-gray-800 border-none shadow-sm hover:shadow-md rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-gray-400">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-xl border border-transparent group-hover:border-white/20 shadow-sm ${iconBg} transition-all`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-gray-50 mt-1">{value}</div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-1 opacity-80">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
});
