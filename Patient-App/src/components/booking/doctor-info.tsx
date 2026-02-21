"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Info, Award, GraduationCap, Star, Stethoscope } from "lucide-react"
import { CertificationItem, CaseItem, StatCard } from "./shared"
import { DoctorData } from "@/lib/shared-logic/types"

const DoctorInfo = memo(function DoctorInfo({ doctor }: { doctor: DoctorData }) {
    return (
        <div className="w-full max-w-md space-y-6 text-center px-4">

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
                {/* Location Button */}
                <Button
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#84cc16] to-[#10b981] hover:from-[#65a30d] hover:to-[#059669] text-white shadow-[0_8px_30px_-10px_rgba(16,185,129,0.4)] border-0 flex items-center justify-center gap-2 group transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
                    onClick={() => window.open(doctor.mapsUrl || "https://www.google.com/maps/search/?api=1&query=Al+Mansour,+Baghdad", "_blank")}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-md" />
                    <MapPin className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">موقع العيادة</span>
                </Button>

                {/* Info Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-14 text-lg font-normal rounded-2xl border-slate-700/60 bg-[#1e293b]/50 text-slate-300 hover:bg-[#1e293b] hover:text-white flex items-center justify-between px-6 group transition-all backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-all" />
                            </div>
                            <span>المعلومات والشهادات</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900/95 border-slate-800 text-white w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto backdrop-blur-xl custom-scrollbar rounded-[32px] p-6 md:p-8" dir="rtl">
                        <DialogHeader className="text-right space-y-0 mt-4 md:mt-2">
                            <DialogTitle className="flex items-start gap-3 text-right">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(8,145,178,0.2)] shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 flex flex-col gap-1">الشهادات والمؤهلات العلمية</h3>
                                    <DialogDescription className="text-slate-400 text-sm md:text-base leading-relaxed">
                                        نبذة تفصيلية عن المؤهلات والخبرات الأكاديمية للدكتور {doctor.nameAr}
                                    </DialogDescription>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-8 mt-2 md:mt-6">
                            <section className="bg-slate-900/40 border border-slate-800 rounded-[28px] p-5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />

                                <div className="flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4 mb-5 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg md:text-xl text-white">المؤهلات الأكاديمية</h3>
                                </div>

                                <div className="grid gap-3 relative z-10">
                                    {doctor.certificatesList && doctor.certificatesList.length > 0 ? (
                                        doctor.certificatesList.map((cert: any, index: number) => (
                                            <div key={index} className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 group">
                                                <div className="w-2 h-2 mt-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm md:text-base text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                                                        {typeof cert === 'string' ? cert : cert.title || cert.name || "شهادة طبية"}
                                                    </h4>
                                                    {typeof cert !== 'string' && cert.subtitle && (
                                                        <p className="text-slate-400 font-mono text-xs md:text-sm tracking-widest text-right mt-1.5 opacity-80" dir="rtl">
                                                            {cert.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500 py-8 gap-3 bg-slate-950/20 rounded-2xl border border-slate-800/50 border-dashed">
                                            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                                                <Info className="w-6 h-6 opacity-40 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium">لا توجد شهادات مضافة حالياً</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 w-full">
                {/* Rating */}
                <div className="relative overflow-hidden bg-[#1e293b]/50 border border-slate-700/50 rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#1e293b]/80 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <Star className="w-8 h-8 text-slate-800 fill-slate-800 -rotate-12" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                        <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">{doctor.rating}</span>
                    <span className="text-xs text-slate-400 font-medium">تقييم المرضى</span>
                </div>

                {/* Experience */}
                <div className="relative overflow-hidden bg-[#1e293b]/50 border border-slate-700/50 rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 group hover:bg-[#1e293b]/80 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <Stethoscope className="w-8 h-8 text-slate-800 -rotate-12" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">+{doctor.yearsExperience}</span>
                    <span className="text-xs text-slate-400 font-medium">سنة خبرة</span>
                </div>
            </div>

            {/* Availability Badge */}
            <div className="pt-4 pb-2">
                <div className="inline-flex items-center gap-2 bg-[#064e3b]/40 border border-[#059669]/30 rounded-full px-5 py-2 backdrop-blur-md shadow-lg">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
                    </span>
                    <span className="text-[#34d399] text-sm font-bold tracking-wide">متاح للحجز اليوم</span>
                </div>
            </div>
        </div>
    );
});

export default DoctorInfo;
