"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, Loader2, X } from "lucide-react";

interface ClinicInfoSectionProps {
    info: {
        name: string;
        phone: string;
        address: string;
        logo?: string;
    };
    onChange: (info: any) => void;
    isEditing: boolean;
    isAdmin: boolean;
}

export function ClinicInfoSection({ info, onChange, isEditing, isAdmin }: ClinicInfoSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'clinic_logos');
            if (info.logo && info.logo.includes('supabase')) {
                formData.append('oldFileUrl', info.logo);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                onChange({ ...info, logo: result.filePath });
            } else {
                console.error('Logo upload failed:', result.error);
                alert("فشل رفع الشعار: " + result.error);
            }
        } catch (error) {
            console.error('Logo upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>اسم المركز / العيادة</Label>
                {isEditing ? (
                    <Input
                        value={info.name}
                        onChange={(e) => onChange({ ...info, name: e.target.value })}
                        className="bg-gray-50 focus:ring-teal-500"
                    />
                ) : (
                    <div className="p-3 bg-gray-50 rounded-md border text-base font-medium">
                        {info.name}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                {isEditing ? (
                    <Input
                        value={info.phone}
                        onChange={(e) => onChange({ ...info, phone: e.target.value })}
                        className="bg-gray-50 text-left focus:ring-teal-500"
                        dir="ltr"
                    />
                ) : (
                    <div className="p-3 bg-gray-50 rounded-md border text-base font-medium text-left" dir="ltr">
                        {info.phone}
                    </div>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>العنوان</Label>
                {isEditing ? (
                    <Input
                        value={info.address}
                        onChange={(e) => onChange({ ...info, address: e.target.value })}
                        className="bg-gray-50 focus:ring-teal-500"
                    />
                ) : (
                    <div className="p-3 bg-gray-50 rounded-md border text-base font-medium">
                        {info.address}
                    </div>
                )}
            </div>

            <div className="space-y-4 md:col-span-2">
                <Label>شعار العيادة</Label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-xl bg-slate-50/50">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                            {info.logo ? (
                                <img src={info.logo} alt="Clinic Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-slate-300" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        <p className="text-sm text-slate-500">
                            سيظهر هذا الشعار في التقارير والفواتير وصفحة الحجز. يفضل استخدام صورة بخلفية شفافة (PNG).
                        </p>
                        {isEditing && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="bg-white hover:bg-slate-50 border-slate-200"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Upload className="w-4 h-4 ml-2" />
                                    رفع شعار جديد
                                </Button>
                                {info.logo && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        onClick={() => onChange({ ...info, logo: "" })}
                                        disabled={uploading}
                                    >
                                        <X className="w-4 h-4 ml-2" />
                                        إزالة
                                    </Button>
                                )}
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Fallback hidden input for the URL to be submitted in the main form if needed, 
                    though here it's handled via the onChange prop to the parent state */}
                <input type="hidden" name="clinic_logo_url" value={info.logo || ""} />
            </div>
        </div>
    );
}
