"use client"
import { memo } from "react"
import { DoctorData } from "@nexus/shared"
import { Bone } from "lucide-react"
import Image from "next/image"

const DoctorCard = memo(function DoctorCard({ doctor }: { doctor: DoctorData }) {
    return (
        <div className="relative w-full max-w-[340px] min-h-[480px] rounded-[48px] p-6 flex flex-col items-center justify-between overflow-hidden group shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.01] duration-500 border border-slate-800/50">
            {/* Card Background & Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] backdrop-blur-3xl z-0" />

            {/* Interactive Glow Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)] z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Scanning Line Effect (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(6,182,212,0.03),transparent)] translate-y-[-100%] group-hover:translate-y-[100%] transition-transform [transition-duration:3000ms] ease-in-out z-10 pointer-events-none" />

            {/* Glow Borders */}
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent z-20 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <div className="absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-blue-500/80 to-transparent z-20 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

            {/* Doctor Image (Large & Premium) */}
            <div className="relative z-20 mt-8 mb-4 group-hover:translate-y-[-5px] transition-transform duration-500">
                {/* Outer Glow Ring */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-b from-cyan-500/20 to-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Image Container */}
                <div className="w-56 h-56 rounded-full p-1.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] relative">
                    <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none z-30" />
                    <div className="w-full h-full rounded-full overflow-hidden border-[6px] border-[#0f172a] relative z-20 bg-[#0f172a]">
                        <Image
                            src={doctor.image}
                            alt={doctor.nameAr}
                            fill
                            sizes="(max-width: 768px) 100vw, 224px"
                            className="object-cover object-top hover:scale-110 transition-transform duration-700 filter brightness-110 contrast-110"
                            priority
                            onError={(e: any) => {
                                // Reset to placeholder on error via standard img tag approach if needed, 
                                // but with Next/Image we typically use blurDataURL or standardized paths.
                                // For simplicity/robustness in this context:
                                e.currentTarget.src = "/doctor-placeholder.svg"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Card Internal Info (Bottom Floating) */}
            <div className="relative z-20 w-full mt-auto pb-1">
                <div className="flex flex-col items-center justify-center gap-1 bg-[#1e293b]/60 backdrop-blur-2xl rounded-[32px] p-5 border border-slate-700/40 shadow-2xl group-hover:border-cyan-500/30 group-hover:bg-[#1e293b]/80 transition-all duration-500 text-center w-full">
                    <h3 className="text-white font-bold text-xl md:text-2xl leading-relaxed tracking-wide drop-shadow-sm">{doctor.nameAr}</h3>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-sm md:text-base tracking-widest">{doctor.titleAr}</p>
                </div>
            </div>
        </div>
    )
});

export default DoctorCard;
