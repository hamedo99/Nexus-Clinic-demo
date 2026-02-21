"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>اسم المركز / العيادة</Label>
                {isEditing ? (
                    <Input
                        value={info.name}
                        onChange={(e) => onChange({ ...info, name: e.target.value })}
                        className="bg-gray-50"
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
                        className="bg-gray-50 text-left"
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
                        className="bg-gray-50"
                    />
                ) : (
                    <div className="p-3 bg-gray-50 rounded-md border text-base font-medium">
                        {info.address}
                    </div>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>رابط الشعار (Logo URL)</Label>
                {isEditing ? (
                    <Input
                        value={info.logo || ""}
                        onChange={(e) => onChange({ ...info, logo: e.target.value })}
                        className="bg-gray-50 text-left"
                        dir="ltr"
                        placeholder="/logo.png"
                    />
                ) : (
                    <div className="p-3 bg-gray-50 rounded-md border text-base font-medium text-left truncate" dir="ltr">
                        {info.logo || "/logo.png"}
                    </div>
                )}
            </div>
        </div>
    );
}
