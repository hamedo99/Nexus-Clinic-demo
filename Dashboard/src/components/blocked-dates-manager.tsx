"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, CalendarIcon, Loader2, Ban } from "lucide-react";
import { addBlockedDate, deleteBlockedDate } from "@/lib/actions";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface BlockedDate {
    id: string;
    startTime: Date;
    endTime: Date;
    reason: string | null;
}

export function BlockedDateManager({ initialData }: { initialData: BlockedDate[] }) {
    const [open, setOpen] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>();
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!range?.from) return;

        setLoading(true);
        try {
            const result = await addBlockedDate({ from: range.from, to: range.to || range.from }, reason || "إغلاق إداري");
            if (result.success) {
                setOpen(false);
                setRange(undefined);
                setReason("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteLoading(id);
        try {
            await deleteBlockedDate(id);
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    يمكنك إضافة أيام العطل أو الإغلاقات الطارئة هنا لمنع الحجز فيها.
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة إغلاق
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>إضافة فترة إغلاق</DialogTitle>
                            <DialogDescription>
                                اختر التواريخ التي ستكون فيها العيادة مغلقة. لن يتمكن المرضى من الحجز في هذه الأيام.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="range">الفترة الزمنية</Label>
                                <div className="border rounded-md p-2 flex justify-center">
                                    <Calendar
                                        mode="range"
                                        selected={range}
                                        onSelect={setRange}
                                        initialFocus
                                        numberOfMonths={1}
                                        locale={ar}
                                        dir="rtl"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reason">سبب الإغلاق (اختياري)</Label>
                                <Input
                                    id="reason"
                                    placeholder="مثال: عطلة رسمية، صيانة، مؤتمر طبي..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>إلغاء</Button>
                            <Button onClick={handleAdd} disabled={!range?.from || loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                                حفظ الإغلاق
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {initialData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-dashed">
                    <CalendarIcon className="h-10 w-10 opacity-20 mb-2" />
                    <span className="text-sm">لا توجد إغلاقات نشطة حالياً</span>
                </div>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {initialData.map((block) => (
                        <div key={block.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white/80 dark:bg-black/40 text-red-800 dark:text-red-200 rounded-lg border border-red-100/80 dark:border-red-900/20 gap-2 shadow-sm group">
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm flex items-center gap-2">
                                    <Ban className="h-4 w-4" />
                                    {block.reason || "إغلاق عام"}
                                </span>
                                <div className="flex items-center gap-2 text-xs opacity-80 mt-1 mr-6">
                                    <span className="bg-red-100 dark:bg-red-900/40 px-1.5 rounded dir-ltr font-mono">
                                        {format(new Date(block.startTime), 'PPP', { locale: ar })}
                                    </span>
                                    <span>-</span>
                                    <span className="bg-red-100 dark:bg-red-900/40 px-1.5 rounded dir-ltr font-mono">
                                        {format(new Date(block.endTime), 'PPP', { locale: ar })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                                <span className="text-[10px] font-bold bg-white/50 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap border border-red-100">
                                    {Math.ceil((new Date(block.endTime).getTime() - new Date(block.startTime).getTime()) / (1000 * 60 * 60 * 24))} أيام
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => handleDelete(block.id)}
                                    disabled={deleteLoading === block.id}
                                >
                                    {deleteLoading === block.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
