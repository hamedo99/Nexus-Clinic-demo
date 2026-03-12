"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Edit3, Save } from "lucide-react";
import { manageDoctor } from "../actions";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  clinicPhone: string | null;
  theme_color: string | null;
  logo_url: string | null;
  isActive: boolean;
};

interface DoctorManagementProps {
  doctors: Doctor[];
}

export function DoctorManagement({ doctors }: DoctorManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor>>({
    theme_color: "#0ea5e9",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDoctor({
      theme_color: "#0ea5e9",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        id: editingDoctor.id,
        name: editingDoctor.name || "",
        specialty: editingDoctor.specialty || "",
        slug: editingDoctor.name?.toLowerCase().replace(/\\s+/g, '-') || "new-doc",
        theme_color: editingDoctor.theme_color || "#0ea5e9",
        logo_url: editingDoctor.logo_url || "",
        isActive: editingDoctor.isActive ?? true,
      };

      const result = await manageDoctor(data);
      if (result.success) {
        toast.success(editingDoctor.id ? "تم تحديث بيانات الطبيب!" : "تم إضافة الطبيب!");
        setIsModalOpen(false);
      } else {
        toast.error(result.error || "فشل حفظ بيانات الطبيب");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm" dir="rtl">
      <div className="flex items-center justify-between p-6 pb-2">
        <h3 className="text-lg font-semibold leading-none tracking-tight">إدارة الأطباء والعيادات</h3>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4 ml-1" />
          <span>إضافة طبيب</span>
        </Button>
      </div>

      <div className="p-6">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right">اسم الطبيب</TableHead>
                <TableHead className="text-right">التخصص</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {doc.theme_color && (
                      <div 
                        className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                        style={{ backgroundColor: doc.theme_color }}
                      />
                    )}
                    {doc.name}
                  </TableCell>
                  <TableCell>{doc.specialty}</TableCell>
                  <TableCell>{doc.clinicPhone || "غير محدد"}</TableCell>
                  <TableCell>
                    <Badge variant={doc.isActive ? "default" : "secondary"}>
                      {doc.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                      <Edit3 className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingDoctor.id ? "تعديل إعدادات الطبيب" : "إضافة طبيب جديد"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4 text-right">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الطبيب</Label>
              <Input
                id="name"
                value={editingDoctor.name || ""}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">التخصص</Label>
              <Input
                id="specialty"
                value={editingDoctor.specialty || ""}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">رابط الشعار (صورة)</Label>
              <Input
                id="logo_url"
                value={editingDoctor.logo_url || ""}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme_color">لون الواجهة</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="theme_color"
                  type="color"
                  className="w-16 h-10 p-1 cursor-pointer"
                  value={editingDoctor.theme_color || "#0ea5e9"}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, theme_color: e.target.value })}
                />
                <span className="text-sm text-muted-foreground uppercase font-mono" dir="ltr">{editingDoctor.theme_color}</span>
              </div>
            </div>

            <div className="flex items-center justify-start gap-2 border-t pt-4">
              <Label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={editingDoctor.isActive}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, isActive: e.target.checked })}
                />
                <span>حساب نشط</span>
              </Label>
            </div>

            <div className="flex justify-start pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="w-4 h-4 ml-1" />
                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
