"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar, Clock, MapPin, Pencil, Trash2, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { editUpcomingAppointment, updateAppointmentStatus } from "@/lib/actions/appointment";

type AppointmentData = {
    id: string;
    startTime: string | Date;
    status: string;
    clinicLocation: string | null;
    patient: {
        id: string;
        fullName: string;
        phoneNumber: string;
    };
};

interface UpcomingProps {
    initialData: {
        appointments: AppointmentData[];
        locations: string[];
        isAdmin: boolean;
    };
}

export function UpcomingAppointmentsClient({ initialData }: UpcomingProps) {
    const [appointments, setAppointments] = useState(initialData.appointments);
    const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [editApId, setEditApId] = useState<string | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editLocation, setEditLocation] = useState("");

    // Cancellation Modal State
    const [cancelApId, setCancelApId] = useState<string | null>(null);
    const [cancelApName, setCancelApName] = useState<string>("");

    const [isPending, startTransition] = useTransition();

    // Derived filtering
    const filteredAppointments = appointments.filter(ap => {
        const matchBranch = selectedBranch === "ALL" || ap.clinicLocation === selectedBranch;
        const searchLower = searchQuery.toLowerCase();
        const matchSearch = ap.patient.fullName.toLowerCase().includes(searchLower) ||
            ap.patient.phoneNumber.includes(searchLower);
        return matchBranch && matchSearch;
    });

    const openEditModal = (ap: AppointmentData) => {
        setEditApId(ap.id);
        const dateObj = new Date(ap.startTime);
        setEditDate(dateObj.toISOString().split("T")[0]);
        setEditTime(format(dateObj, "HH:mm"));
        setEditStatus(ap.status);
        setEditLocation(ap.clinicLocation || "");
    };

    const handleSaveEdit = () => {
        if (!editApId || !editDate || !editTime) return;
        const targetId = editApId;
        const targetDate = editDate;
        const targetTime = editTime;
        const targetStatus = editStatus;
        const targetLocation = editLocation;

        // 1. Optimistic UI Update: Instant feedback without waiting for server
        setAppointments(prev => prev.map(ap => {
            if (ap.id === targetId) {
                const newStart = new Date(targetDate);
                const [h, m] = targetTime.split(':').map(Number);
                newStart.setHours(h, m, 0, 0);
                return { ...ap, startTime: newStart, status: targetStatus, clinicLocation: targetLocation };
            }
            return ap;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));

        // 2. Hide modal instantly for 0ms delay experience
        setEditApId(null);

        // 3. Background server sync
        startTransition(() => {
            editUpcomingAppointment(targetId, {
                dateStr: targetDate,
                timeStr: targetTime,
                status: targetStatus,
                location: targetLocation
            });
        });
    };

    const handleCancelAppointment = (id: string, name: string) => {
        setCancelApId(id);
        setCancelApName(name);
    };

    const confirmCancelAppointment = () => {
        if (!cancelApId) return;
        const targetId = cancelApId;

        // 1. Optimistic UI Update: Change status instantly
        setAppointments(prev => prev.map(ap => ap.id === targetId ? { ...ap, status: "CANCELLED" } : ap));

        // 2. Hide modal instantly for 0ms delay experience
        setCancelApId(null);

        // 3. Background server sync
        startTransition(() => {
            updateAppointmentStatus(targetId, "CANCELLED");
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
            case "CONFIRMED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
            case "CANCELLED": return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING": return "قيد الانتظار";
            case "CONFIRMED": return "مؤكد";
            case "CANCELLED": return "ملغي";
            default: return status;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">المواعيد القادمة</h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        استعراض وتعديل الجداول والمواعيد المؤكدة وقيد الانتظار
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 mb-6">

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedBranch === "ALL" ? "default" : "outline"}
                        onClick={() => setSelectedBranch("ALL")}
                        className={`rounded-full px-5 ${selectedBranch === "ALL" ? "shadow-md" : ""}`}
                    >
                        كل الفروع
                    </Button>
                    {initialData.locations.map(loc => (
                        <Button
                            key={loc}
                            variant={selectedBranch === loc ? "default" : "outline"}
                            onClick={() => setSelectedBranch(loc)}
                            className={`rounded-full px-5 ${selectedBranch === loc ? "bg-primary shadow-md text-white" : ""}`}
                        >
                            <MapPin className="w-4 h-4 ml-1.5 opacity-70" />
                            {loc}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="بحث بالاسم أو رقم الهاتف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary/30"
                    />
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-gray-800/50">
                            <TableRow className="border-b border-slate-100 dark:border-gray-700">
                                <TableHead className="text-right py-4 font-bold text-slate-600 dark:text-slate-300">المريض</TableHead>
                                <TableHead className="text-right py-4 font-bold text-slate-600 dark:text-slate-300">التاريخ</TableHead>
                                <TableHead className="text-right py-4 font-bold text-slate-600 dark:text-slate-300">الوقت</TableHead>
                                <TableHead className="text-right py-4 font-bold text-slate-600 dark:text-slate-300">الحالة</TableHead>
                                <TableHead className="text-center py-4 font-bold text-slate-600 dark:text-slate-300">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                        لا توجد مواعيد قادمة تتطابق مع بحثك
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAppointments.map(ap => (
                                    <TableRow key={ap.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors border-b border-slate-50 dark:border-gray-800">
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{ap.patient.fullName}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 font-medium font-sans tracking-tight" dir="ltr">{ap.patient.phoneNumber}</span>
                                                    {ap.clinicLocation && (
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[10px] px-1.5 py-0 border border-slate-200/50 font-semibold gap-1">
                                                            <MapPin className="w-3 h-3 text-primary opacity-70" />
                                                            {ap.clinicLocation}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                                                <Calendar className="w-4 h-4 text-primary/70" />
                                                {format(new Date(ap.startTime), "EEEE، d MMMM yyyy", { locale: ar })}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1 mr-6">
                                                {format(new Date(ap.startTime), "yyyy-MM-dd", { locale: ar })}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold bg-slate-50 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {format(new Date(ap.startTime), "hh:mm a", { locale: ar })}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <Badge className={`px-2.5 py-1 ${getStatusStyle(ap.status)} border-none shadow-none font-bold`}>
                                                {getStatusLabel(ap.status)}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full h-8 w-8"
                                                    onClick={() => openEditModal(ap)}
                                                    title="تعديل الموعد"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full h-8 w-8"
                                                    onClick={() => handleCancelAppointment(ap.id, ap.patient.fullName)}
                                                    disabled={ap.status === "CANCELLED"}
                                                    title="إلغاء الموعد"
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editApId} onOpenChange={(open) => !open && setEditApId(null)}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-2xl text-primary font-bold">تعديل الموعد القادم</DialogTitle>
                        <DialogDescription>
                            يمكنك تحديث تفاصيل هذا الموعد، بما في ذلك الموقع والتاريخ.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-slate-600 font-bold">التاريخ</Label>
                            <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="col-span-3 font-sans text-left"
                                dir="ltr"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-slate-600 font-bold">الوقت</Label>
                            <Input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="col-span-3 font-sans text-left"
                                dir="ltr"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-slate-600 font-bold">موقع العيادة</Label>
                            <Select value={editLocation} onValueChange={setEditLocation}>
                                <SelectTrigger className="col-span-3 text-right">
                                    <SelectValue placeholder="اختر الموقع/الفرع" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialData.locations.length === 0 && <SelectItem value="all" disabled>لا توجد فروع مسجلة</SelectItem>}
                                    {initialData.locations.map(loc => (
                                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-slate-600 font-bold">الحالة</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger className="col-span-3 text-right">
                                    <SelectValue placeholder="حالة الموعد" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                                    <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                                    <SelectItem value="CANCELLED">ملغي</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="flex-row-reverse sm:justify-start gap-2">
                        <Button onClick={handleSaveEdit} disabled={isPending} className="font-bold w-full sm:w-auto shadow-md">
                            {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditApId(null)} className="font-bold w-full sm:w-auto bg-slate-50">
                            إلغاء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <Dialog open={!!cancelApId} onOpenChange={(open) => !open && setCancelApId(null)}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] border-red-100 dark:border-red-900/30 overflow-hidden" dir="rtl">
                    <DialogHeader className="text-center pt-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5 ring-4 ring-red-50/50 dark:ring-red-500/5">
                            <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">إلغاء الموعد</DialogTitle>
                        <DialogDescription className="text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                            هل أنت متأكد أنك تريد إلغاء موعد المريض <span className="font-bold text-slate-800 dark:text-slate-200">{cancelApName}</span>؟
                            <br />هذا الإجراء سيقوم بتغيير حالة الموعد ولن يمكن التراجع عنه.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-row-reverse sm:justify-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-gray-800/60 pb-2">
                        <Button
                            onClick={confirmCancelAppointment}
                            disabled={isPending}
                            variant="destructive"
                            className="font-bold w-full sm:w-auto shadow-sm hover:shadow-md transition-all h-11 px-8 rounded-xl"
                        >
                            {isPending ? "جاري الإلغاء..." : "نعم، الغي الموعد"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCancelApId(null)}
                            className="font-bold w-full sm:w-auto bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300 h-11 px-8 rounded-xl transition-all"
                        >
                            تراجع
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
