"use client"
import * as React from "react"
import { memo } from "react";
import DoctorCard from "./booking/doctor-card"
import DoctorInfo from "./booking/doctor-info"
import BookingForm from "./booking/booking-form"
import { DoctorData, BookingConfig } from "@/lib/shared-logic/types"

export const BookingClient = memo(function BookingClient({ doctor, config }: { doctor: DoctorData, config?: BookingConfig }) {

    return (
        <div className="min-h-screen w-full bg-[#0f172a] text-white p-4 md:p-8 font-sans relative overflow-hidden" dir="rtl">
            {/* Background Ambience - Low res blur for performance */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none transform-gpu" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none transform-gpu" />

            <div className="max-w-5xl mx-auto relative z-10 space-y-8 md:space-y-12">

                {/* Top Section: Doctor Profile & Info - Static content, fast render */}
                <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700 relative z-20">
                    <DoctorCard doctor={doctor} />
                    <DoctorInfo doctor={doctor} />
                </div>

                {/* Booking Wizard - Contains complex logic & state */}
                <div id="booking-section" className="scroll-mt-6">
                    <BookingForm config={config} doctorId={doctor.id} doctorName={doctor.nameAr} />
                </div>

            </div>
        </div>
    );
});

export default BookingClient;
