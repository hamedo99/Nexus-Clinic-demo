"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelGlobalAppointment } from "../actions";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

type GlobalAppointment = {
  id: string;
  startTime: Date;
  status: string;
  doctorName: string;
};

interface GlobalAppointmentsProps {
  appointments: GlobalAppointment[];
}

export function GlobalAppointments({ appointments }: GlobalAppointmentsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد فرض إلغاء هذا الموعد؟")) return;
    
    setLoadingId(id);
    const result = await cancelGlobalAppointment(id);
    setLoadingId(null);
    
    if (result.success) {
      toast.success("تم فرض إلغاء الموعد بنجاح.");
    } else {
      toast.error(result.error || "فشل الإلغاء.");
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "مؤكد";
      case "CANCELLED": return "ملغى";
      case "PENDING": return "قيد الانتظار";
      case "COMPLETED": return "مكتمل";
      case "NO_SHOW": return "لم يحضر";
      default: return status;
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border shadow-sm" dir="rtl">
      <div className="flex items-center p-6 pb-2">
        <h3 className="text-lg font-semibold leading-none tracking-tight">المواعيد القادمة على مستوى النظام</h3>
      </div>
      <div className="p-6">
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">لا توجد مواعيد قادمة في النظام.</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">الطبيب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{format(new Date(app.startTime), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(app.startTime), "hh:mm a")}</TableCell>
                    <TableCell className="font-medium">{app.doctorName}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === "CONFIRMED" ? "default" : app.status === "CANCELLED" ? "destructive" : "secondary"}>
                        {translateStatus(app.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      {app.status !== "CANCELLED" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={loadingId === app.id}
                          onClick={() => handleCancel(app.id)}
                          className="flex items-center gap-1.5 mr-auto shadow-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>إلغاء</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
