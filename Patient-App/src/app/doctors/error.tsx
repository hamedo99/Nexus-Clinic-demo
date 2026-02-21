"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Page bounded error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    عذراً، حدث خطأ غير متوقع
                </h2>
                <p className="text-slate-500 max-w-md">
                    حاولنا جلب البيانات ولكن واجهنا مشكلة في النظام. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.
                </p>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                    {error.message || "Unknown Server Error"}
                </p>
            </div>
            <Button
                onClick={() => reset()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
            >
                إعادة المحاولة
            </Button>
        </div>
    );
}
