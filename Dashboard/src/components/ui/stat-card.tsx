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
        <Card className={`border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${iconBg} transition-colors`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mt-1">{value}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1 opacity-80">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
});
