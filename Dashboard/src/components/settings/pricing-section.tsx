"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Users } from "lucide-react";

interface PricingSectionProps {
    price: number;
    patientsPerHour: number;
    setPrice: (v: number) => void;
    setPatientsPerHour: (v: number) => void;
    isEditing: boolean;
}

export function PricingSection({ price, patientsPerHour, setPrice, setPatientsPerHour, isEditing }: PricingSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed">
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                    <Label>سعر الكشفية (د.ع)</Label>
                </div>
                {isEditing ? (
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                        className="bg-gray-50 text-left"
                        dir="ltr"
                    />
                ) : (
                    <div className="p-3 bg-emerald-50/50 rounded-md border text-base font-medium flex justify-between items-center">
                        <span>{price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">دينار عراقي</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <Label>المرضى بالساعة</Label>
                </div>
                {isEditing ? (
                    <Input
                        type="number"
                        value={patientsPerHour}
                        onChange={(e) => setPatientsPerHour(parseInt(e.target.value) || 0)}
                        className="bg-gray-50 text-center"
                        min={1}
                    />
                ) : (
                    <div className="p-3 bg-blue-50/50 rounded-md border text-base font-medium text-center">
                        {patientsPerHour}
                    </div>
                )}
            </div>
        </div>
    );
}
