"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save, Loader2, Clock, Pencil, X } from "lucide-react";

// Sub-components
import { ClinicInfoSection } from "./settings/clinic-info-section";
import { WorkingHoursSection } from "./settings/working-hours-section";
import { PricingSection } from "./settings/pricing-section";

import { updateDoctorClinicSettings } from "@/lib/actions";

export function SettingsForm({
    initialInfo,
    initialHours,
    initialPrice,
    initialPatientsPerHour,
    role
}: {
    initialInfo: any,
    initialHours: any,
    initialPrice: number,
    initialPatientsPerHour: number,
    role?: string
}) {
    const isAdmin = role === "ADMIN";
    const [info, setInfo] = useState(initialInfo);
    const [hours, setHours] = useState(initialHours);
    const [price, setPrice] = useState(initialPrice);
    const [patientsPerHour, setPatientsPerHour] = useState(initialPatientsPerHour);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        setSuccess("");
        try {
            const formData = new FormData();
            formData.append("name", info.name);
            formData.append("phone", info.phone);
            formData.append("address", info.address);
            formData.append("logo", info.logo || "");
            formData.append("price", price.toString());
            formData.append("patientsPerHour", patientsPerHour.toString());
            formData.append("startHour", hours.start.toString());
            formData.append("endHour", hours.end.toString());

            const result = await updateDoctorClinicSettings(formData);
            if (result.success) {
                // Synchronize state with updated data from server
                if (result.data) {
                    const d = result.data;
                    setInfo({
                        name: d.name,
                        phone: d.clinicPhone,
                        address: d.address,
                        logo: d.clinicLogo
                    });
                    setPrice(d.consultationPrice);
                    setPatientsPerHour(d.patientsPerHour);
                    setHours(d.workingHours);
                }

                setSuccess("✅ تم حفظ التغييرات ومزامنتها بنجاح");
                setIsEditing(false);

                // Success message disappears after 3 seconds
                setTimeout(() => setSuccess(""), 3000);
            } else {
                alert("حدث خطأ أثناء الحفظ: " + (result.error || "خطأ غير معروف"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2 border-primary/20 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle>معلومات العيادة</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ClinicInfoSection
                            info={info}
                            onChange={setInfo}
                            isEditing={isEditing}
                            isAdmin={isAdmin}
                        />
                        {!isAdmin && (
                            <PricingSection
                                price={price}
                                setPrice={setPrice}
                                patientsPerHour={patientsPerHour}
                                setPatientsPerHour={setPatientsPerHour}
                                isEditing={isEditing}
                            />
                        )}
                    </CardContent>
                </Card>

                {!isAdmin && (
                    <Card className="border-primary/20 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <CardTitle>ساعات العمل</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <WorkingHoursSection
                                hours={hours}
                                onChange={setHours}
                                isEditing={isEditing}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
                <div>{success && <span className="text-green-600 font-medium">{success}</span>}</div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                                <X className="ml-2 h-4 w-4" /> إلغاء
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                                حفظ التغييرات
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} variant="secondary">
                            <Pencil className="ml-2 h-4 w-4" /> تعديل المعلومات
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
