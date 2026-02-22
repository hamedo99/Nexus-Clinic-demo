"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { Mail, Lock, ArrowLeft, Stethoscope, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300"
            disabled={pending}
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري التحقق...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <span>تسجيل الدخول</span>
                    <ArrowLeft size={20} className="mr-auto" />
                </div>
            )}
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null);

    return (
        <div className="min-h-screen bg-white flex flex-col lg:grid lg:grid-cols-2" dir="rtl">
            {/* Branding Side - Hidden on Mobile */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 overflow-hidden items-center justify-center p-12">
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[100px]" />

                <div className="relative z-10 text-white max-w-lg text-right">
                    <div className="mb-8 inline-flex p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
                        <Stethoscope size={48} className="text-emerald-300" />
                    </div>
                    <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
                        نيكسوس كلينيك <br />
                        <span className="text-emerald-300">NexusClinic OS</span>
                    </h1>
                    <p className="text-xl text-emerald-50/80 leading-relaxed mb-12 font-medium">
                        نظام الإدارة المتكامل المصمم لرفع كفاءة عيادتك وتوفير تجربة استثنائية لمرضاك. تحكم كامل، دقة متناهية، وسهولة في الاستخدام.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <ShieldCheck className="text-emerald-400 mb-3" size={24} />
                            <h3 className="font-bold mb-1">آمن ومعتمد</h3>
                            <p className="text-sm text-emerald-50/60">تشفير كامل لبيانات المرضى وسجلاتهم الطبية.</p>
                        </div>
                        <div className="p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                            <div className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center mb-3">
                                <span className="text-emerald-400 text-xs font-bold">24/7</span>
                            </div>
                            <h3 className="font-bold mb-1">وصول مستمر</h3>
                            <p className="text-sm text-emerald-50/60">أدر عيادتك من أي مكان وفي أي وقت.</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 right-12 text-emerald-300/40 font-mono text-sm tracking-widest">
                    V 2.0.4 - POWERED BY NEXUS
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50/50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="p-3 bg-teal-600 rounded-2xl shadow-xl">
                            <Stethoscope size={32} className="text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">مرحباً بك مجدداً</h2>
                        <p className="text-gray-500 font-medium">يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم</p>
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100">
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-gray-700 mr-1">البريد الإلكتروني</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        required
                                        className="h-12 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                    <Label htmlFor="password" className="text-sm font-bold text-gray-700 mr-1">كلمة المرور</Label>
                                    <button type="button" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
                                        نسيت كلمة المرور؟
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="h-12 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {state?.error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-shake">
                                    <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
                                    <p>{state.error}</p>
                                </div>
                            )}

                            <SubmitButton />
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                            <p className="text-xs text-gray-400 font-medium">
                                نظام نيكسوس لإدارة العيادات <br />
                                جميع الحقوق محفوظة © 2026
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-6 text-gray-400">
                        <button className="text-sm hover:text-teal-600 transition-colors">المساعدة</button>
                        <button className="text-sm hover:text-teal-600 transition-colors">الخصوصية</button>
                        <button className="text-sm hover:text-teal-600 transition-colors">الشروط</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
