"use client"
import React, { memo } from "react"
import { DoctorData } from "@/lib/shared-logic/types"
import { Stethoscope } from "lucide-react"
import Image from "next/image"

const DoctorCard = memo(function DoctorCard({ doctor }: { doctor: DoctorData }) {
    const [imgSrc, setImgSrc] = React.useState(doctor.image || "/doctors/profile.jpg");
    const fallback = "/doctors/profile.jpg";

    return (
        <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-[40px] flex flex-col justify-end overflow-hidden group mx-auto shadow-2xl border border-slate-800/20 bg-gradient-to-b from-slate-200 to-slate-400">
            {/* Doctor Full Image */}
            <Image
                src={imgSrc}
                alt={doctor.nameAr}
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover object-top"
                priority
                onError={() => setImgSrc(fallback)}
            />

            {/* Top Right Glass Icon */}
            <div className="absolute top-5 right-5 w-11 h-11 rounded-[14px] border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center z-20 shadow-sm">
                <Stethoscope className="w-5 h-5 text-cyan-400" />
            </div>

            {/* Bottom Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#0f172a] via-[#0f172a]/90 to-transparent z-10 pointer-events-none" />

            {/* Text Content */}
            <div className="relative z-20 text-center pb-8 px-4">
                <h3 className="text-white font-bold text-[22px] tracking-wide drop-shadow-md">{doctor.nameEn || "Dr."}</h3>
                {doctor.titleEn && <p className="text-cyan-400 font-medium text-[15px] mt-1">{doctor.titleEn}</p>}
            </div>
        </div>
    )
});

export default DoctorCard;
