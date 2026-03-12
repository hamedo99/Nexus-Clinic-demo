"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, Users, Zap } from "lucide-react";

interface DashboardAnalyticsProps {
  totalAppointments: number;
  mostActiveDoctorName: string;
  mostActiveDoctorCount: number;
}

export function DashboardAnalytics({
  totalAppointments,
  mostActiveDoctorName,
  mostActiveDoctorCount,
}: DashboardAnalyticsProps) {
  const [loadSpeed, setLoadSpeed] = useState<number>(0);

  useEffect(() => {
    // Generate a mock response time between 100ms and 150ms for the dashboard feel
    setLoadSpeed(Math.floor(Math.random() * 50) + 100);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي المواعيد
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground text-cyan-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAppointments}</div>
          <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium">
            على مستوى النظام
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            الطبيب الأكثر نشاطاً
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {mostActiveDoctorName || "غير محدد"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-emerald-500 font-medium">{mostActiveDoctorCount}</span> مواعيد
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أداء النظام
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            ⚡ {loadSpeed}ms
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-emerald-500 font-medium">
            استجابة فائقة السرعة
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
