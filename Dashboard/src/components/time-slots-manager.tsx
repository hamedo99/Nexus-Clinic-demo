"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Clock } from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface TimeSlotsManagerProps {
  value?: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
  locations?: string[];
}

const days = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

export function TimeSlotsManager({ value = [], onChange, readOnly = false, locations = [] }: TimeSlotsManagerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(value);

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(),
      day: "الأحد",
      startTime: "09:00",
      endTime: "17:00",
      location: "العيادة الرئيسية"
    };
    const newSlots = [...slots, newSlot];
    setSlots(newSlots);
    onChange(newSlots);
  };

  const removeSlot = (id: string) => {
    const newSlots = slots.filter(slot => slot.id !== id);
    setSlots(newSlots);
    onChange(newSlots);
  };

  const updateSlot = (id: string, field: keyof TimeSlot, value: string) => {
    const newSlots = slots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    setSlots(newSlots);
    onChange(newSlots);
  };

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={slot.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center shrink-0 hidden sm:flex">
            <Clock className="w-5 h-5" />
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex-1">
              <Select
                value={slot.day}
                onValueChange={(value) => updateSlot(slot.id, 'day', value)}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm z-10">من:</div>
              <Select
                value={slot.startTime}
                onValueChange={(val) => updateSlot(slot.id, 'startTime', val)}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-10 text-left disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => 10 + i).map(h => {
                    const time = `${h.toString().padStart(2, '0')}:00`;
                    const label = h > 12 ? `${h - 12}:00 مساءً` : (h === 12 ? "12:00 مساءً" : `${h}:00 صباحاً`);
                    return <SelectItem key={time} value={time}>{label}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm z-10">إلى:</div>
              <Select
                value={slot.endTime}
                onValueChange={(val) => updateSlot(slot.id, 'endTime', val)}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-10 text-left disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => 10 + i).map(h => {
                    const time = `${h.toString().padStart(2, '0')}:00`;
                    const label = h > 12 ? `${h - 12}:00 مساءً` : (h === 12 ? "12:00 مساءً" : `${h}:00 صباحاً`);
                    return <SelectItem key={time} value={time}>{label}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative md:col-span-3">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm z-10">الموقع / العيادة:</div>
              {locations && locations.length > 0 ? (
                <Select
                  value={slot.location || ""}
                  onValueChange={(val) => updateSlot(slot.id, 'location', val)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-28 text-right disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100">
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="مثال: عيادة المنصور"
                  value={slot.location || ""}
                  onChange={(e) => updateSlot(slot.id, 'location', e.target.value)}
                  className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-28 text-right disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                  disabled={readOnly}
                />
              )}
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => removeSlot(slot.id)}
              className="shrink-0 p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="حذف الوقت"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={addSlot}
          className="w-full border-dashed border-2 border-slate-200 text-slate-500 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 bg-transparent rounded-xl py-6"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة وقت جديد
        </Button>
      )}

      {slots.length === 0 && (
        <div className="text-center py-6 text-slate-400">
          <p className="text-sm">لم تقم بإضافة أوقات عمل بعد.</p>
        </div>
      )}
    </div>
  );
}
