"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkingHoursSectionProps {
    hours: { start: number, end: number };
    onChange: (hours: any) => void;
    isEditing: boolean;
}

export function WorkingHoursSection({ hours, onChange, isEditing }: WorkingHoursSectionProps) {
    const format = (h: number) => {
        const dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        return `${dh} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="space-y-4">
            {isEditing ? (
                <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <Label>من الساعة</Label>
                        <Input
                            type="number"
                            min={0}
                            max={23}
                            value={hours.start}
                            onChange={(e) => onChange({ ...hours, start: parseInt(e.target.value) })}
                            className="bg-gray-50 text-center font-bold"
                        />
                    </div>
                    <span className="text-2xl mt-6">-</span>
                    <div className="flex-1 space-y-2">
                        <Label>إلى الساعة</Label>
                        <Input
                            type="number"
                            min={0}
                            max={23}
                            value={hours.end}
                            onChange={(e) => onChange({ ...hours, end: parseInt(e.target.value) })}
                            className="bg-gray-50 text-center font-bold"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <span className="font-medium text-muted-foreground">دوام العيادة اليومي</span>
                    <div className="flex items-center gap-2 font-bold text-lg text-primary" dir="ltr">
                        <span>{format(hours.start)}</span>
                        <span>-</span>
                        <span>{format(hours.end)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
