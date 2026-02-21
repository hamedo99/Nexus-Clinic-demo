"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDoctor } from "@/lib/actions";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
            {pending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
    );
}

export function EditDoctorDialog({ doctor }: { doctor: any }) {
    const [state, formAction] = useActionState(updateDoctor, null);
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تعديل بيانات الطبيب</DialogTitle>
                    <DialogDescription>
                        تعديل الاسم، التخصص، أو بيانات الدخول للطبيب.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={formAction} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={doctor.id} />

                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
                        <Input id="name" name="name" defaultValue={doctor.name} className="text-right" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="specialty" className="text-right">التخصص</Label>
                        <Input id="specialty" name="specialty" defaultValue={doctor.specialty} className="text-right" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address" className="text-right">العنوان</Label>
                        <Input id="address" name="address" defaultValue={doctor.address || ""} className="text-right" placeholder="العنوان (اختياري)" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slug" className="text-right">رابط الحجز (Slug)</Label>
                        <Input id="slug" name="slug" defaultValue={doctor.slug} className="text-right" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="subscriptionStatus" className="text-right">حالة الاشتراك</Label>
                        <Select name="subscriptionStatus" defaultValue={doctor.subscriptionStatus || "TRIAL"}>
                            <SelectTrigger className="text-right" dir="rtl">
                                <SelectValue placeholder="اختر حالة الاشتراك" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="ACTIVE">نشط (Active)</SelectItem>
                                <SelectItem value="TRIAL">تجريبي (Trial)</SelectItem>
                                <SelectItem value="EXPIRED">منتهي (Expired)</SelectItem>
                                <SelectItem value="DISABLED">معطل (Disabled)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2 pt-4 border-t border-dashed">
                        <Label className="text-right font-bold text-muted-foreground mb-1">بيانات الدخول (اختياري)</Label>

                        <Label htmlFor="email" className="text-right text-xs">تحديث البريد الإلكتروني</Label>
                        <Input id="email" name="email" type="email" placeholder="اتركه فارغاً للاحتفاظ بالبريد الحالي" className="text-right" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-right text-xs">تحديث كلمة المرور</Label>
                        <Input id="password" name="password" type="password" placeholder="اتركها فارغة للاحتفاظ بكلمة المرور الحالية" className="text-right" />
                    </div>

                    {state?.message && (
                        <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </p>
                    )}

                    <SubmitButton />
                </form>
            </DialogContent>
        </Dialog>
    )
}
