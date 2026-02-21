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
}

interface TimeSlotsManagerProps {
  value?: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  readOnly?: boolean;
}

const days = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"
];

export function TimeSlotsManager({ value = [], onChange, readOnly = false }: TimeSlotsManagerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(value);

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(),
      day: "الأحد",
      startTime: "09:00",
      endTime: "17:00"
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
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm">من:</div>
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-10 text-left disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                dir="ltr"
                disabled={readOnly}
              />
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-sm">إلى:</div>
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                className="bg-white border-slate-200 focus:ring-teal-500 rounded-lg pr-10 text-left disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                dir="ltr"
                disabled={readOnly}
              />
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
