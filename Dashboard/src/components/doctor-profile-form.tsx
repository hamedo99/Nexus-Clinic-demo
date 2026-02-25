"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { updateFullDoctorProfile } from "@/lib/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Camera, Loader2, MapPin, User, Save, Award, Clock, Phone, DollarSign, Users, Edit, X, CheckCircle, XCircle, CalendarX } from "lucide-react";
import { TimeSlotsManager } from "./time-slots-manager";
import { CertificatesManager } from "./certificates-manager";
import { LocationsManager, ClinicLocation } from "./locations-manager";

export function DoctorProfileForm({ doctor, onUpdate }: { doctor: any, onUpdate?: () => void }) {
    const [state, formAction, isPending] = useActionState(updateFullDoctorProfile, null);
    const [showStatus, setShowStatus] = useState(false);
    const [activeTab, setActiveTab] = useState<"clinic" | "profile" | "schedule" | "locations">("clinic");
    const [isEditing, setIsEditing] = useState(false);

    // Dynamic Lists
    const initialCerts = (doctor?.certificates_list as any[]) || [];
    const [certificates, setCertificates] = useState<any[]>(initialCerts.map(c => typeof c === 'string' ? { id: Math.random().toString(), title: c, description: "", issuer: "", year: "" } : c));
    const [timeSlots, setTimeSlots] = useState<any[]>(doctor.working_hours_schedule?.slots || []);
    const [locations, setLocations] = useState<ClinicLocation[]>(doctor.clinic_locations || []);

    // JSON hidden state
    const [workingHours, setWorkingHours] = useState(doctor.working_hours_schedule || { text: "" });
    const [disableFridays, setDisableFridays] = useState<boolean>((doctor.disabledDaysOfWeek || []).includes(5));

    // Profile Image
    const [profileImage, setProfileImage] = useState<string>(doctor.profile_image_path || "");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'doctors_profiles');
            if (profileImage) {
                formData.append('oldFileUrl', profileImage);
            }


            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setProfileImage(result.filePath);
            } else {
                console.error('Upload failed:', result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
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
            <input type="hidden" name="clinic_locations" value={JSON.stringify(locations)} />

            {/* Custom Tabs Navigation and Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit shadow-sm border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab("clinic")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "clinic" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                    >
                        <Building2 className="w-4 h-4" /> إعدادات العيادة
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "profile" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                    >
                        <User className="w-4 h-4" /> الملف الشخصي
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("locations")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "locations" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                    >
                        <MapPin className="w-4 h-4" /> فروع العيادة
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("schedule")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "schedule" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                    >
                        <Award className="w-4 h-4" /> الشهادات والأوقات
                    </button>
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
                                    className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10"
                                    />
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="text-slate-700">العنوان الكامل</Label>
                                <div className="relative">
                                    <Input
                                        id="address"
                                        name="address"
                                        defaultValue={doctor?.address || ""}
                                        placeholder="مثال: بغداد، المنصور، شارع 14 رمضان"
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10"
                                    />
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
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
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10"
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
                                        className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10"
                                    />
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {/* Weekly Day-off Toggle */}
                        <div className="mt-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="flex items-center gap-5 text-right">
                                <div className={`p-4 rounded-2xl ${disableFridays ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'} transition-colors duration-500 shadow-sm shadow-inner`}>
                                    <CalendarX className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-900 text-xl tracking-tight">إغلاق العيادة يوم الجمعة دائمياً</p>
                                    <p className="text-sm text-slate-500 font-medium">سيتم تعطيل كافة أيام الجمعة من تقويم الحجز للمرضى بشكل آلي.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={!isEditing}
                                onClick={() => setDisableFridays(!disableFridays)}
                                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${disableFridays ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-slate-300'}`}
                            >
                                <span
                                    className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform duration-500 shadow-md ${disableFridays ? 'translate-x-8' : 'translate-x-1'}`}
                                />
                            </button>
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

                                <div className="space-y-2">
                                    <Label htmlFor="years_of_experience" className="text-slate-700">سنين الخبرة</Label>
                                    <div className="relative">
                                        <Input
                                            id="years_of_experience"
                                            name="years_of_experience"
                                            type="number"
                                            defaultValue={doctor?.years_of_experience ?? 0}
                                            className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                            disabled={!isEditing}
                                        />
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="Maps_url" className="text-slate-700">رابط خرائط جوجل</Label>
                                    <div className="relative">
                                        <Input
                                            id="Maps_url"
                                            name="Maps_url"
                                            defaultValue={doctor?.Maps_url || ""}
                                            placeholder="https://maps.google.com/?q=..."
                                            className="rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 pl-10 disabled:bg-slate-50 disabled:text-slate-600 disabled:opacity-100"
                                            disabled={!isEditing}
                                        />
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    </div>
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
