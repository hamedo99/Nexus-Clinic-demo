"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Stethoscope, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center font-sans space-y-6 dir-rtl">
            {/* Visual Element */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center relative z-10 shadow-2xl">
                    <Stethoscope className="w-16 h-16 text-cyan-500 opacity-50" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px] rounded-full pointer-events-none" />
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">الطبيب غير موجود</h1>
                <p className="text-slate-400 text-lg">عذراً، لم نتمكن من العثور على الملف الشخصي للطبيب الذي تبحث عنه.</p>
            </div>

            <div className="pt-8">
                <Link href="/">
                    <Button className="h-14 px-8 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_8px_30px_-10px_rgba(8,145,178,0.4)] flex items-center justify-center gap-2 transition-all duration-300">
                        <Home className="w-5 h-5" />
                        <span>العودة للرئيسية</span>
                    </Button>
                </Link>
            </div>
        </div>
    )
}
