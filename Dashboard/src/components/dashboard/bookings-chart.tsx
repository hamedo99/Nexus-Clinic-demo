"use client";

import { useMemo, memo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

interface BookingsChartProps {
    data?: Array<{ date: string; count: number }>;
}

export const BookingsChart = memo(function BookingsChart({ data }: BookingsChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map(item => {
            const dateObj = new Date(item.date);
            const formattedDate = dateObj.toLocaleDateString("ar-EG", { weekday: 'short', month: 'numeric', day: 'numeric' });
            return {
                name: formattedDate,
                المواعيد: item.count
            };
        });
    }, [data]);

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden mt-8">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b p-4">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        <span>الحجوزات خلال آخر 7 أيام</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] p-6 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            itemStyle={{ color: "#0ea5e9" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="المواعيد"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorUv)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
});
