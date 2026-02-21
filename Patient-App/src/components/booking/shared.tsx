import * as React from "react"
import { cn } from "@/lib/utils"
import { GraduationCap, Award, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

import { DoctorData, BookingConfig } from "@/lib/shared-logic/types"

export interface Certification {
    icon: React.ReactNode
    colorClass: string
    title: string
    subtitle: string
    subtitleDir?: "ltr" | "rtl"
    extraInfo?: string
}

export interface SuccessCase {
    id: number
    image: string
    title: string
    description: string
}

// Components

const getColorClasses = (color: string) => {
    switch (color) {
        case "blue": return "bg-blue-500/10 text-blue-400"
        case "amber": return "bg-amber-500/10 text-amber-400"
        case "emerald": return "bg-emerald-500/10 text-emerald-400"
        case "purple": return "bg-purple-500/10 text-purple-400"
        default: return "bg-slate-500/10 text-slate-400"
    }
}

export const CertificationItem = ({ item }: { item: Certification }) => (
    <div className="flex gap-4 items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors group">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 transition-transform group-hover:scale-110", getColorClasses(item.colorClass))}>
            {item.icon}
        </div>
        <div>
            <h4 className="font-bold text-lg text-white mb-1">{item.title}</h4>
            {item.extraInfo && <p className="text-slate-400 text-sm mb-1">{item.extraInfo}</p>}
            <p className="text-slate-400 font-mono text-sm tracking-widest text-left" dir={item.subtitleDir || "rtl"}>
                {item.subtitle}
            </p>
        </div>
    </div>
)

export const CaseItem = ({ item }: { item: SuccessCase }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:shadow-2xl hover:shadow-cyan-900/20 transition-all duration-500">
        <div className="aspect-video relative overflow-hidden bg-black">
            {/* Using img for external/svg or simple usage, but next/image preferred if dimensions known. 
                For SVGs or varying sizes, standard img with some optimization is okay, 
                but we'll stick to simple img based on original code for SVGs 
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                onError={(e) => (e.target as HTMLImageElement).src = "/doctor-placeholder.svg"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.description}</p>
            </div>
        </div>
    </div>
)

export const StatCard = ({ icon, value, label, iconColorClass, containerClassName, link }: {
    icon: React.ReactNode,
    value: React.ReactNode,
    label: string,
    iconColorClass?: string,
    containerClassName?: string,
    link?: string
}) => {
    const CardContent = () => (
        <div className={cn(
            "rounded-3xl border backdrop-blur-md flex flex-col items-center justify-center gap-1 group transition-all hover:-translate-y-1 cursor-pointer shadow-lg",
            !containerClassName?.includes("w-") && "w-24",
            !containerClassName?.includes("h-") && "h-24",
            !containerClassName?.includes("bg-") && "bg-slate-800/40",
            !containerClassName?.includes("border-") && "border-slate-700/50 hover:border-slate-600",
            containerClassName
        )}>
            <div className={cn(
                "rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110",
                !iconColorClass?.includes("w-") && "w-10 h-10",
                iconColorClass
            )}>
                {icon}
            </div>
            <span className={cn("font-bold text-center leading-tight px-1 whitespace-nowrap", containerClassName?.includes("text-white") ? "text-white" : "text-slate-200", containerClassName?.includes("text-xl") ? "text-xl" : "text-lg")}>{value}</span>
            <span className={cn("text-[11px]", containerClassName?.includes("text-white") ? "text-white/80" : "text-slate-500")}>{label}</span>
        </div>
    )

    if (link) {
        return <a href={link} target="_blank" rel="noopener noreferrer" className="block"><CardContent /></a>
    }
    return <CardContent />
}
