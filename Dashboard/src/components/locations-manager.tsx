"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, MapPin, Phone, Link as LinkIcon } from "lucide-react";

export interface ClinicLocation {
    id: string;
    name: string;
    address: string;
    phone: string;
    mapsUrl: string;
}

interface LocationsManagerProps {
    value?: ClinicLocation[];
    onChange: (locations: ClinicLocation[]) => void;
    isEditing?: boolean;
}

export function LocationsManager({ value = [], onChange, isEditing = false }: LocationsManagerProps) {
    const [locations, setLocations] = useState<ClinicLocation[]>(value);

    const addLocation = () => {
        const newLocation: ClinicLocation = {
            id: Math.random().toString(36).substr(2, 9),
            name: "",
            address: "",
            phone: "",
            mapsUrl: ""
        };
        const newLocations = [...locations, newLocation];
        setLocations(newLocations);
        onChange(newLocations);
    };

    const removeLocation = (id: string) => {
        const newLocations = locations.filter(loc => loc.id !== id);
        setLocations(newLocations);
        onChange(newLocations);
    };

    const updateLocation = (id: string, field: keyof ClinicLocation, val: string) => {
        const newLocations = locations.map(loc =>
            loc.id === id ? { ...loc, [field]: val } : loc
        );
        setLocations(newLocations);
        onChange(newLocations);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {locations.map((loc, index) => (
                    <div key={loc.id} className="relative group bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-teal-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">{index + 1}</span>
                                {loc.name || "موقع جديد"}
                            </h4>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => removeLocation(loc.id)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs">اسم الموقع / المركز</Label>
                                <Input
                                    value={loc.name}
                                    onChange={(e) => updateLocation(loc.id, 'name', e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="مثال: مجمع الحارثية الطبي"
                                    className="bg-white border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs">رقم الهاتف للموقع</Label>
                                <div className="relative">
                                    <Input
                                        value={loc.phone}
                                        onChange={(e) => updateLocation(loc.id, 'phone', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="رقم خاص بهذا الفرع"
                                        className="bg-white border-slate-200 rounded-xl pl-10"
                                    />
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-600 text-xs">العنوان التفصيلي</Label>
                                <div className="relative">
                                    <Input
                                        value={loc.address}
                                        onChange={(e) => updateLocation(loc.id, 'address', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="بغداد، الكرادة، قرب ساحة كهرمانة"
                                        className="bg-white border-slate-200 rounded-xl pl-10"
                                    />
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-600 text-xs">رابط Google Maps المباشر (الرابط الدقيق للعيادة)</Label>
                                <div className="relative">
                                    <Input
                                        value={loc.mapsUrl}
                                        onChange={(e) => updateLocation(loc.id, 'mapsUrl', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="الصق الرابط المباشر من جوجل ماب هنا (مثل https://goo.gl/maps/...)"
                                        className="bg-white border-slate-200 rounded-xl pl-10"
                                    />
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isEditing && (
                <Button
                    type="button"
                    onClick={addLocation}
                    variant="outline"
                    className="w-full h-16 border-dashed border-2 border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 rounded-2xl flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة موقع عمل جديد
                </Button>
            )}

            {locations.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">لا يوجد مواقع مضافة حالياً</p>
                    <p className="text-slate-400 text-xs mt-1 italic">أضف مواقعك ليتمكن المرضى من اختيارها</p>
                </div>
            )}
        </div>
    );
}
