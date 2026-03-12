"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, Award, GraduationCap, BookOpen, Calendar } from "lucide-react"
import { DoctorData } from "@/lib/shared-logic/types"

const DoctorInfo = memo(function DoctorInfo({ doctor }: { doctor: DoctorData }) {
    // Split the name for the colored styling "د. أسامة الجنابي" -> "الجنابي" in cyan
    const nameParts = doctor.nameAr.split(" ");
    if (nameParts.length < 2) nameParts.push(""); // Fallback just in case
    const lastName = nameParts[nameParts.length - 1];
    const restName = nameParts.slice(0, -1).join(" ");

    return (
        <div className="w-full max-w-md space-y-6 flex flex-col items-center text-center px-4 -mt-2">

            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 bg-[#1e293b]/60 border border-slate-700/50 rounded-full px-5 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                </span>
                <span className="text-slate-200 text-[13px] font-medium tracking-wide">متاح للحجز اليوم</span>
            </div>

            {/* Doctor Name */}
            <div className="space-y-1.5 mt-2">
                <h1 className="text-[32px] font-black text-white tracking-tight drop-shadow-sm">
                    {restName} <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{lastName}</span>
                </h1>

                {/* Doctor Title */}
                <p className="text-slate-300/80 text-[15px] font-light tracking-wide px-4">
                    {doctor.titleAr || "استشاري جراحة العظام والمفاصل والكسور"}
                </p>
            </div>

            {/* Action Buttons: Book & Info */}
            <div className="w-full flex justify-center items-center gap-3 mt-4 px-2">
                <Button
                    className="w-[50%] max-w-[160px] h-12 text-[15px] font-bold rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 group"
                    onClick={() => {
                        document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                >
                    <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>احجز موعد</span>
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-[50%] max-w-[160px] h-12 text-sm font-medium rounded-2xl border-slate-700/50 bg-slate-800/20 text-slate-200 hover:bg-slate-800/40 hover:text-white flex items-center justify-center gap-2 transition-all backdrop-blur-sm shadow-sm ring-1 ring-white/5 group">
                            <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                            <span>المعلومات</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="bg-slate-900/95 border-slate-800 text-white w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto backdrop-blur-xl custom-scrollbar rounded-[32px] p-6 md:p-8" dir="rtl">
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
        </div>
    );
});

export default DoctorInfo;
