"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Settings, Users, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminSettingsClient({ role }: { role?: string }) {
    return (
        <div className="space-y-8 max-w-7xl mx-auto p-1 h-full overflow-y-auto custom-scrollbar pb-20" dir="rtl">
            <div className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-teal-800 flex items-center gap-3">
                    <Settings className="h-8 w-8 text-teal-600" />
                    إعدادات النظام العامة
                </h1>
                <p className="text-muted-foreground text-lg">
                    إدارة إعدادات المنصة، الصلاحيات، والمستخدمين للإدارة المركزية.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {/* Security / System */}
                <Card className="border-slate-200/80 bg-white shadow-sm hover:shadow transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-teal-600" />
                            <CardTitle className="text-slate-800">الأمان والصلاحيات</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500">مراجعة أمان المنصة والصلاحيات</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <span className="font-medium text-slate-700">المستخدم الحالي</span>
                                <span className="text-xs font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full uppercase tracking-wider">
                                    مدير النظام
                                </span>
                            </div>
                            <Button variant="outline" className="w-full">
                                تغيير كلمة المرور للمسؤول
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Management */}
                <Card className="border-slate-200/80 bg-white shadow-sm hover:shadow transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-slate-800">إدارة الأطباء والسكرتارية</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500">إضافة مستخدمين جدد للنظام أو إيقافهم</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4">
                            قم بزيارة قسم إدارة الحسابات للتحكم بحسابات الأطباء والعيادات المسجلة بالمنصة.
                        </p>
                        <Button variant="default" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            الذهاب لإدارة المستخدمين
                        </Button>
                    </CardContent>
                </Card>

                {/* Database Actions */}
                <Card className="border-slate-200/80 bg-white shadow-sm hover:shadow transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-rose-600" />
                            <CardTitle className="text-slate-800">قاعدة البيانات</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500">النسخ الاحتياطي والصيانة</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4">
                            تحميل نسخة احتياطية لكامل النظام لمعالجة الحالات الطارئة.
                        </p>
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                            أخذ نسخة احتياطية (قريباً)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
