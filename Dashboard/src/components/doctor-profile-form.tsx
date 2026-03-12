"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { updateFullDoctorProfile } from "@/lib/actions/doctor";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Camera, Loader2, MapPin, User, Save, Award, Clock, Phone, DollarSign, Users, Edit, X, CheckCircle, XCircle, CalendarX } from "lucide-react";
import { TimeSlotsManager } from "./time-slots-manager";
import { CertificatesManager } from "./certificates-manager";
import { LocationsManager, ClinicLocation } from "./locations-manager";

type TabKey = "clinic" | "profile" | "locations" | "schedule";

const TABS: { id: TabKey; label: string; icon: React.ElementType }[] = [
    { id: "clinic", label: "إعدادات العيادة", icon: Building2 },
    { id: "profile", label: "الملف الشخصي", icon: User },
    { id: "locations", label: "فروع العيادة", icon: MapPin },
    { id: "schedule", label: "الشهادات والأوقات", icon: Award },
];

/**
 * Reusable Premium UX Toggle Component
 */
const SettingToggle = ({
    enabled,
    onChange,
    disabled,
    title,
    description,
    icon: Icon,
    activeColorClass = "green"
}: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    disabled: boolean;
    title: string;
    description: string;
    icon: React.ElementType | string;
    activeColorClass?: "green" | "rose" | "cyan";
}) => {
    // Determine dynamic colors
    const colors = {
        green: { bg: "bg-green-100", text: "text-green-600", shadow: "shadow-green-200/50", toggleBg: "bg-green-500 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]", container: "from-green-50 to-white border-green-100" },
        rose: { bg: "bg-rose-100", text: "text-rose-600", shadow: "shadow-rose-200/50", toggleBg: "bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]", container: "from-slate-50 to-white border-slate-100" },
        cyan: { bg: "bg-cyan-100", text: "text-cyan-600", shadow: "shadow-cyan-200/50", toggleBg: "bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]", container: "from-cyan-50 to-white border-cyan-100" }
    };

    const activeStyle = colors[activeColorClass];

    return (
        <div className={`mt-6 p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br ${enabled ? activeStyle.container : 'from-slate-50 to-white border-slate-100'} border flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden relative shadow-sm`}>
            {enabled && <div className={`absolute -left-20 -top-20 w-48 h-48 bg-${activeColorClass}-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                <div className="flex items-center gap-6 text-right relative z-10 w-full md:w-auto">
                    <div className={`p-4 rounded-[1.5rem] ${enabled ? `${activeStyle.bg} ${activeStyle.text} ${activeStyle.shadow}` : 'bg-slate-100 text-slate-500 shadow-slate-200/50'} transition-all duration-500 shadow-sm border border-white shrink-0`}>
                        {typeof Icon === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: Icon }} className={`w-8 h-8 md:w-9 md:h-9 ${enabled ? 'scale-110' : 'scale-100'} transition-transform duration-500`} />
                        ) : (
                            <Icon className={`w-8 h-8 md:w-9 md:h-9 ${enabled ? 'scale-110' : 'scale-100'} transition-transform duration-500`} />
                        )}
                    </div>
                    <div className="space-y-1.5 flex-1 p-1">
                        <p className="font-black text-slate-800 text-xl md:text-2xl tracking-tight">{title}</p>
                        <p className="text-sm md:text-base text-slate-500/80 font-semibold max-w-sm leading-relaxed">{description}</p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(!enabled)}
                    className={`relative shrink-0 inline-flex h-10 w-[72px] cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${enabled ? activeStyle.toggleBg : 'bg-slate-300 hover:bg-slate-400'} relative z-10`}
                >
                    <span className="sr-only">{title}</span>
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${enabled ? '-translate-x-9' : 'translate-x-0'}`}
                    />
                </button>
            </div>
        </div>
    );
};

export function DoctorProfileForm({ doctor, onUpdate }: { doctor: any, onUpdate?: () => void }) {
    const [state, formAction, isPending] = useActionState(updateFullDoctorProfile, null);
    const [showStatus, setShowStatus] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>("clinic");
    const [isEditing, setIsEditing] = useState(false);

    // Dynamic Lists
    const initialCerts = (doctor?.certificates_list as any[]) || [];
    const [certificates, setCertificates] = useState<any[]>(initialCerts.map(c => typeof c === 'string' ? { id: Math.random().toString(), title: c, description: "", issuer: "", year: "" } : c));
    const [timeSlots, setTimeSlots] = useState<any[]>(doctor.working_hours_schedule?.slots || []);
    const [locations, setLocations] = useState<ClinicLocation[]>(doctor.clinic_locations || []);

    // JSON hidden state
    const [workingHours, setWorkingHours] = useState(doctor.working_hours_schedule || { text: "" });
    const [disableFridays, setDisableFridays] = useState<boolean>((doctor.disabledDaysOfWeek || []).includes(5));

    // WhatsApp Reminders state
    const [isRemindersEnabled, setIsRemindersEnabled] = useState<boolean>(doctor.is_reminders_enabled || false);

    // Sync state if doctor props change (server action refresh)
    useEffect(() => {
        if (doctor) {
            setIsRemindersEnabled(doctor.is_reminders_enabled || false);
            setDisableFridays((doctor.disabledDaysOfWeek || []).includes(5));
            setTimeSlots(doctor.working_hours_schedule?.slots || []);
            setLocations(doctor.clinic_locations || []);
        }
    }, [doctor]);

    // Profile Image
    const [profileImage, setProfileImage] = useState<string>(doctor.profile_image_path || "");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // WhatsApp Bot UI State
    const [botStatus, setBotStatus] = useState<{ isConnected: boolean, qrCode: string }>({ isConnected: false, qrCode: "" });
    const [testPhone, setTestPhone] = useState("");
    const [isSendingTest, setIsSendingTest] = useState(false);

    // Polling WhatsApp API logic
    useEffect(() => {
        if (!isRemindersEnabled) return;

        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                // Poll WhatsApp Bot Server URL (uses env var or defaults to localhost:4000)
                const botApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "http://localhost:4000";
                const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "secret-api-key";
                const res = await fetch(`${botApiUrl}/api/whatsapp/status`, {
                    headers: { "x-api-key": apiKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBotStatus(data);
                }
            } catch (e) {
                // Ignore silent errors if bot is down
                console.log("Bot server not reachable");
            }
        };

        // Check immediately then every 3 seconds
        checkStatus();
        interval = setInterval(checkStatus, 3000);

        return () => clearInterval(interval);
    }, [isRemindersEnabled]);

    const handleSendTest = async () => {
        if (!testPhone || testPhone.length < 10) {
            alert("الرجاء إدخال رقم هاتف صحيح");
            return;
        }

        setIsSendingTest(true);
        try {
            const botApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "http://localhost:4000";
            const apiKey = process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "secret-api-key";
            const res = await fetch(`${botApiUrl}/api/whatsapp/test`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-api-key": apiKey
                },
                body: JSON.stringify({ phone: testPhone })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ " + data.message);
                setTestPhone(""); // clear after success
            } else {
                alert("❌ " + data.message);
            }
        } catch (e) {
            alert("❌ تعذر الاتصال بالخادم الداخلي لإرسال الرسالة.");
        } finally {
            setIsSendingTest(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://snnriudqqwlphtnuhlex.supabase.co";
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubnJpdWRxcXdscGh0bnVobGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjM2MDEsImV4cCI6MjA4NjM5OTYwMX0.-NrqQKCUlBIuZRt5VAdHx2EjT1waSQQ1NlkhPUKj37k";
            const supabase = createClient(supabaseUrl, supabaseKey);

            const fileExtension = file.name.split('.').pop() || 'png';
            // Fallback for crypto.randomUUID() in some browsers
            const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            const uniqueFilename = `${randomId}.${fileExtension}`;
            const filePath = `doctors_profiles/${uniqueFilename}`;

            const { data, error } = await supabase.storage.from('nexus_uploads').upload(filePath, file);

            if (error) {
                console.error('Upload failed:', error);
                alert('فشل رفع الصورة: ' + error.message);
            } else {
                // Delete old image from bucket if we have one
                if (profileImage && profileImage.includes('nexus_uploads')) {
                    try {
                        const urlParts = profileImage.split('/nexus_uploads/');
                        if (urlParts.length > 1) {
                            const oldFilePath = urlParts[1];
                            // Suppress errors if we fail to delete old, not critical to the user flow
                            await supabase.storage.from('nexus_uploads').remove([oldFilePath]);
                        }
                    } catch (e) {
                        console.warn('Silent failure removing old picture', e);
                    }
                }

                const { data: publicUrlData } = supabase.storage.from('nexus_uploads').getPublicUrl(filePath);
                setProfileImage(publicUrlData.publicUrl);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('حدث خطأ غير متوقع أثناء الرفع');
        } finally {
            setUploading(false);
        }
    };

    // Auto-disable edit mode and refresh cache upon successful save
    useEffect(() => {
        if (state) {
            setShowStatus(true);
            const timer = setTimeout(() => setShowStatus(false), 4000);

            if (state.success) {
                setIsEditing(false);
                if (onUpdate) onUpdate();
            }
            return () => clearTimeout(timer);
        }
    }, [state, onUpdate]);

    return (
        <form action={formAction} className="relative pb-24">
            {/* Status Messages / Toast */}
            {showStatus && state?.message && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-8 duration-500 ${state.success ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'}`}>
                    <div className="flex items-center gap-3 px-2">
                        {state.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        <span className="font-bold text-lg">{state.message}</span>
                    </div>
                </div>
            )}
            <input type="hidden" name="id" value={doctor?.id || ""} />
            <input type="hidden" name="certificates_list" value={JSON.stringify(certificates)} />
            <input type="hidden" name="working_hours_schedule" value={JSON.stringify({ ...workingHours, slots: timeSlots })} />
            <input type="hidden" name="profile_image_path" value={profileImage || ""} />
            <input type="hidden" name="disableFridays" value={String(disableFridays)} />
            <input type="hidden" name="is_reminders_enabled" value={String(isRemindersEnabled)} />
            <input type="hidden" name="clinic_locations" value={JSON.stringify(locations)} />

            {/* Custom Tabs Navigation and Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap bg-slate-100/90 p-1.5 rounded-2xl w-fit shadow-inner border border-slate-200/60 backdrop-blur-sm gap-1.5 transition-all">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`px-5 py-2.5 rounded-[14px] text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === id
                                ? "bg-white text-teal-700 shadow-[0_2px_15px_rgba(13,148,136,0.12)] ring-1 ring-slate-100 scale-[1.02]"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                }`}
                        >
                            <Icon className={`w-4 h-4 transition-colors ${activeTab === id ? 'text-teal-600' : 'text-slate-400'}`} /> {label}
                        </button>
                    ))}
                </div>

                <div>
                    {!isEditing ? (
                        <Button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل البيانات
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                // Optional: Reset local state back to 'doctor' prop values if needed here.
                            }}
                            variant="destructive"
                            className="rounded-lg shadow-sm"
                        >
                            <X className="w-4 h-4 ml-2" />
                            إلغاء التعديل
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {/* 1. Clinic Settings Tab */}
                {activeTab === "clinic" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-teal-600" /> معلومات العيادة
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">البيانات الأساسية التي ستظهر في الموقع للعيادة</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="clinic_name" className="text-slate-700">اسم العيادة / المركز</Label>
                                <Input
                                    id="clinic_name"
                                    name="clinic_name"
                                    defaultValue={doctor?.name || ""}
                                    placeholder="مثال: عيادة النور التخصصية"
                                    className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clinicPhone" className="text-slate-700">رقم الهاتف العام</Label>
                                <div className="relative">
                                    <Input
                                        id="clinicPhone"
                                        name="clinicPhone"
                                        defaultValue={doctor?.clinicPhone || ""}
                                        placeholder="+964 7XX XXX XXXX"
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                        disabled={!isEditing}
                                    />
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="consultationPrice" className="text-slate-700">سعر الكشفية (دينار عراقي)</Label>
                                <div className="relative">
                                    <Input
                                        id="consultationPrice"
                                        name="consultationPrice"
                                        type="number"
                                        defaultValue={doctor?.consultationPrice ?? 25000}
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                        disabled={!isEditing}
                                    />
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="patientsPerHour" className="text-slate-700">عدد المرضى في الساعة (تلقائي)</Label>
                                <div className="relative">
                                    <Input
                                        id="patientsPerHour"
                                        name="patientsPerHour"
                                        type="number"
                                        defaultValue={doctor?.patientsPerHour ?? 4}
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                        disabled={!isEditing}
                                    />
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Weekly Day-off Toggle */}
                        <SettingToggle
                            enabled={disableFridays}
                            onChange={setDisableFridays}
                            disabled={!isEditing}
                            title="إغلاق العيادة دائمياً يوم الجمعة"
                            description="تُعطّل جميع أيام الجمعة من نظام المواعيد تلقائياً."
                            icon={CalendarX}
                            activeColorClass="rose"
                        />

                        {/* WhatsApp Reminder Settings */}
                        <div className="flex flex-col gap-2">
                            <SettingToggle
                                enabled={isRemindersEnabled}
                                onChange={setIsRemindersEnabled}
                                disabled={!isEditing}
                                title="تفعيل التذكير الآلي عبر الواتساب"
                                description="إرسال رسائل تذكير للمرضى بمواعيدهم بمجرد تأكيدها."
                                icon={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>`}
                                activeColorClass="green"
                            />

                            {isRemindersEnabled && (
                                <div className="space-y-3 animate-in fade-in duration-300 border-t border-green-100 pt-6">
                                    <Label htmlFor="whatsapp_message_template" className="text-slate-700 font-bold text-lg">نص رسالة التذكير</Label>
                                    <textarea
                                        id="whatsapp_message_template"
                                        name="whatsapp_message_template"
                                        defaultValue={doctor?.whatsapp_message_template || "مرحبا {{patient_name}}، نود تذكيرك بموعدك القادم يوم {{date}} الساعة {{time}}."}
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-200 focus:border-green-500 focus:ring-green-500/20 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100 p-4 resize-none transition-all shadow-inner"
                                        disabled={!isEditing}
                                    />
                                    <p className="text-sm text-slate-500 mt-2 font-medium bg-white/50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-green-600 font-bold ml-1">المتغيرات المتاحة:</span>
                                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1 text-slate-700">{"{{patient_name}}"}</code> <span className="text-xs text-slate-500">(اسم المريض), </span>
                                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1 text-slate-700">{"{{time}}"}</code> <span className="text-xs text-slate-500">(وقت الموعد), </span>
                                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded mx-1 text-slate-700">{"{{date}}"}</code> <span className="text-xs text-slate-500">(تاريخ الموعد)</span>
                                    </p>
                                </div>
                            )}

                            {/* Connection Status Section */}
                            {isRemindersEnabled && (
                                <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in duration-300">
                                    <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                        حالة الربط مع واتساب <Loader2 className={`w-4 h-4 text-green-600 ${botStatus.isConnected ? 'hidden' : 'animate-spin'}`} />
                                    </h4>

                                    {botStatus.isConnected ? (
                                        <div className="flex flex-col md:flex-row items-center justify-between py-6 px-8 bg-green-50/50 rounded-xl border border-green-100/50 gap-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                                </div>
                                                <div>
                                                    <span className="text-green-700 font-bold text-lg block">متصل بنجاح والتذكيرات الفورية تعمل!</span>
                                                    <p className="text-sm text-green-600/80 mt-1">الرقم مرتبط بالنظام بشكل سليم.</p>
                                                </div>
                                            </div>

                                            {/* Test Message Form */}
                                            <div className="w-full md:w-auto bg-white p-4 rounded-xl border border-green-100 shadow-sm flex flex-col gap-3 min-w-[280px]">
                                                <Label className="text-sm font-bold text-slate-700">تنبيه تجريبي (Test Message)</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={testPhone}
                                                        onChange={(e) => setTestPhone(e.target.value)}
                                                        placeholder="أدخل رقمك الخاص (ex: 077...)"
                                                        className="text-left bg-slate-50 border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                                                        dir="ltr"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={handleSendTest}
                                                        disabled={isSendingTest || !testPhone}
                                                        className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                                                    >
                                                        {isSendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال"}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-slate-400">ستصل رسالة تجريبية الآن لرقمك.</p>
                                            </div>
                                        </div>
                                    ) : botStatus.qrCode ? (
                                        <div className="flex flex-col md:flex-row items-center gap-8 py-4 px-2">
                                            <div className="p-4 bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.08)] border border-slate-100">
                                                <div className="w-48 h-48 md:w-56 md:h-56 relative rounded-xl overflow-hidden shadow-inner">
                                                    <img src={botStatus.qrCode} alt="WhatsApp QR Code" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right flex-1 space-y-4">
                                                <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full mb-2 border border-amber-200">بانتظار مسح الرمز</div>
                                                <h5 className="font-black text-slate-800 text-xl md:text-2xl">يرجى مسح الـ QR Code لتسجيل الدخول</h5>
                                                <ol className="text-slate-600 text-sm md:text-base space-y-2 list-decimal list-inside font-medium pr-2">
                                                    <li>افتح تطبيق واتساب على هاتفك.</li>
                                                    <li>اضغط على <strong>القائمة</strong> (ثلاث نقاط) في الأعلى واختر <strong>الأجهزة المرتبطة</strong>.</li>
                                                    <li>اضغط على <strong>ربط جهاز</strong>.</li>
                                                    <li>وجه كاميرا الهاتف نحو الرمز المربع الظاهر هنا.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-400" />
                                            <p className="font-medium">جارٍ توليد الرمز المربع (QR Code)...</p>
                                            <p className="text-xs mt-1 text-slate-400">تأكد من تشغيل خادم البوت (whatsapp-bot) في الخلفية</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. Doctor Profile Tab */}
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <User className="h-5 w-5 text-teal-600" /> الملف الشخصي للطبيب
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">المعلومات المهنية التي تظهر للمريض عن الطبيب المختص</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Circular Image Uploader */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-4 border-slate-50 bg-slate-100 overflow-hidden shadow-sm flex items-center justify-center relative">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Doctor preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-slate-300" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isEditing) fileInputRef.current?.click();
                                        }}
                                        disabled={!isEditing}
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={!isEditing}
                                />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700">تغيير الصورة</p>
                                    <p className="text-xs text-slate-400">JPG أو PNG تحت 5MB</p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="doctor_name" className="text-slate-700">اسم الطبيب (للعرض العام)</Label>
                                    <Input
                                        id="doctor_name"
                                        name="doctor_name"
                                        defaultValue={doctor?.doctor_name || doctor?.name || ""}
                                        placeholder="مثال: د. أحمد علي"
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="doctor_name_en" className="text-slate-700">اسم الطبيب (باللغة الإنجليزية)</Label>
                                    <Input
                                        id="doctor_name_en"
                                        name="doctor_name_en"
                                        defaultValue={doctor?.doctor_name_en || ""}
                                        placeholder="مثال: Dr. Ahmed Ali"
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100 text-left"
                                        disabled={!isEditing}
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialty_title" className="text-slate-700">التخصص الدقيق</Label>
                                    <Input
                                        id="specialty_title"
                                        name="specialty_title"
                                        defaultValue={doctor?.specialty_title || doctor?.specialty || ""}
                                        placeholder="مثال: أخصائي جراحة القلب والقسطرة"
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                        disabled={!isEditing}
                                    />
                                </div>


                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Locations Tab */}
                {activeTab === "locations" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-teal-600" /> فروع ومواقع العيادة
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">أضف جميع فروع عيادتك ليتمكن المريض من اختيار الفرع الأقرب له</p>
                        </div>
                        <LocationsManager
                            value={locations}
                            onChange={setLocations}
                            isEditing={isEditing}
                        />
                    </div>
                )}

                {/* 4. Schedule and Certificates Tab */}
                {activeTab === "schedule" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-teal-600" /> جدول الدوام والمواقع
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">حدد ساعات تواجدك في كل موقع حسب أيام الأسبوع</p>
                        </div>
                        <div className="grid gap-12">
                            <div className="space-y-4">
                                <Label className="text-lg font-bold text-slate-700">أوقات العمل في المواقع</Label>
                                <TimeSlotsManager
                                    value={timeSlots}
                                    onChange={setTimeSlots}
                                    readOnly={!isEditing}
                                    locations={locations.map(l => l.name)} // Pass location names
                                />
                            </div>

                            <div className="space-y-4 border-t border-slate-100 pt-8">
                                <Label className="text-lg font-bold text-slate-700 font-bold flex items-center gap-2">
                                    <Award className="w-5 h-5 text-teal-600" /> الشهادات العلمية والخبرات
                                </Label>
                                <CertificatesManager value={certificates} onChange={setCertificates} readOnly={!isEditing} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Submit Button - Only visible in Edit mode */}
            {
                isEditing && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
                        <Button
                            type="submit"
                            className="w-full max-w-sm rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 ml-2" />
                                    حفظ جميع التغييرات
                                </>
                            )}
                        </Button>
                    </div>
                )
            }
        </form >
    );
}                            
