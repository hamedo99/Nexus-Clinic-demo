"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockClinicDays } from "@/lib/actions";
import { DoorClosed, DoorOpen, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function ClinicStatusWidget({ initialStatus, initialReason }: { initialStatus: boolean, initialReason?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState(1);
    const [reason, setReason] = useState("إغلاق مؤقت");
    const router = useRouter();

    const handleBlock = async () => {
        setLoading(true);
        const result = await blockClinicDays(days, reason);
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            alert("فشل في إغلاق العيادة");
        }
    };

    return (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col justify-center items-center text-center relative group">
            <h3 className="font-semibold text-primary mb-2">حالة العيادة</h3>

            {initialStatus ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <DoorOpen size={14} />
                        مفتوحة الآن
                    </span>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-600 hover:text-red-700 hover:bg-red-50 mt-1 h-6">
                                <Lock size={12} className="ml-1" />
                                إغلاق العيادة
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>إغلاق العيادة</DialogTitle>
                                <DialogDescription>
                                    سيتم منع الحجوزات الجديدة خلال فترة الإغلاق.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="days">عدد أيام الإغلاق</Label>
                                    <Input
                                        type="number"
                                        id="days"
                                        min={1}
                                        value={days}
                                        onChange={(e) => setDays(parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">تبدأ من اليوم.</p>
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="reason">سبب الإغلاق</Label>
                                    <Input
                                        type="text"
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                                <Button variant="destructive" onClick={handleBlock} disabled={loading}>
                                    تأكيد الإغلاق
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-1">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <DoorClosed size={14} />
                        مغلقة
                    </span>
                    {initialReason && <span className="text-xs text-muted-foreground">{initialReason}</span>}
                </div>
            )}
        </div>
    );
}
