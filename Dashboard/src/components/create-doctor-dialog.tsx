"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDoctor } from "@/lib/actions";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "جاري الحفظ..." : "حفظ بيانات الطبيب"}
        </Button>
    );
}

export function CreateDoctorDialog() {
    const [state, formAction, isPending] = useActionState(createDoctor, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
        }
    }, [state]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة طبيب جديد
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>إضافة طبيب جديد</DialogTitle>
                    <DialogDescription>
                        سيتم إنشاء حساب جديد للطبيب ورابط حجز خاص به.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="grid gap-4 py-4" dir="rtl">
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm bg-muted p-2 rounded-md">1. بيانات الهوية والعيادة</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-right">اسم الطبيب</Label>
                            <Input id="name" name="name" placeholder="د. محمد علي" className="text-right" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="specialty" className="text-right">التخصص</Label>
                            <Input id="specialty" name="specialty" placeholder="طبيب أسنان" className="text-right" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug" className="text-right">رابط الحجز (Slug Generator)</Label>
                            <Input id="slug" name="slug" placeholder="dr-ali" className="text-right" />
                            <p className="text-[10px] text-muted-foreground text-right">
                                سيصبح: domain.com/book/<b>dr-ali</b>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-2">
                        <h4 className="font-bold text-sm bg-muted p-2 rounded-md">2. إدارة الاشتراك والوصول</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="subscriptionStatus" className="text-right">حالة الاشتراك</Label>
                            <Select name="subscriptionStatus" defaultValue="TRIAL">
                                <SelectTrigger className="text-right" dir="rtl">
                                    <SelectValue placeholder="اختر حالة الاشتراك" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="ACTIVE">نشط (Active)</SelectItem>
                                    <SelectItem value="TRIAL">تجريبي (Trial)</SelectItem>
                                    <SelectItem value="EXPIRED">منتهي (Expired)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-right">اسم المستخدم (Username/Email)</Label>
                            <Input id="email" name="email" placeholder="admin-ali" className="text-left" dir="ltr" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-right">كلمة المرور (Password)</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••••" className="text-left" dir="ltr" required />
                        </div>
                    </div>

                    {state?.message && (
                        <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </p>
                    )}

                    <DialogFooter className="mt-4 gap-2">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "جاري الإضافة..." : "إنشاء حساب الطبيب والعيادة"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
