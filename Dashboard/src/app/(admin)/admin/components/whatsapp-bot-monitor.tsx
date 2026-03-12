"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCcw, Wifi, WifiOff, ServerCrash, Loader2 } from "lucide-react";

type BotStatus = {
  status: "connected" | "disconnected" | "loading" | "error";
  qrCode?: string;
  error?: string;
};

export function WhatsappBotMonitor() {
  const [botStatus, setBotStatus] = useState<BotStatus>({ status: "loading" });

  const checkBotStatus = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/whatsapp/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      const data = await response.json();
      setBotStatus(data);
    } catch (error) {
      console.error("Bot monitor error:", error);
      setBotStatus({ status: "error", error: "تعذر الاتصال بخادم البوت" });
    }
  };

  useEffect(() => {
    checkBotStatus();
    // Poll every 10 seconds
    const interval = setInterval(checkBotStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-md border-indigo-100 dark:border-indigo-900 bg-white dark:bg-gray-900 transition-all hover:shadow-lg" dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
          <Bot className="w-5 h-5 ml-1 text-indigo-500" />
          البنية التحتية للمراسلة
        </CardTitle>
        <button
          onClick={checkBotStatus}
          className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 p-2 rounded-full transition-all"
          title="تحديث الحالة"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {botStatus.status === "loading" && (
            <div className="flex flex-col items-center gap-3 animate-pulse text-indigo-300">
              <Loader2 className="w-12 h-12 opacity-50 animate-spin" />
              <p className="font-medium">يتم جلب حالة النظام الرئيسي...</p>
            </div>
          )}

          {botStatus.status === "connected" && (
            <div className="flex flex-col items-center gap-4 py-4 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/10 p-5 rounded-full border border-emerald-200 dark:border-emerald-800 relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <Wifi className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">النظام متصل ويعمل بكفاءة</h4>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                  خادم المراسلة التلقائي (WhatsApp Web) متصل وجاهز للعمل.
                </p>
              </div>
              <Badge variant="outline" className="mt-2 text-xs py-1 px-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-full font-bold uppercase tracking-widest shadow-sm">
                Operational
              </Badge>
            </div>
          )}

          {(botStatus.status === "disconnected" || botStatus.status === "error") && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-900/10 p-5 rounded-full border border-red-200 dark:border-red-800 shadow-[0_0_20px_rgba(239,68,68,0.15)] shadow-red-500/10">
                {botStatus.status === "error" ? (
                  <ServerCrash className="w-10 h-10 text-red-600 dark:text-red-400" />
                ) : (
                  <WifiOff className="w-10 h-10 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="space-y-1 w-full px-2">
                <h4 className="text-xl font-black text-red-700 dark:text-red-400 tracking-tight">النظام مفصول</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 font-medium">
                  {botStatus.error || "يجب إعادة مصادقة البوت باستخدام الهاتف."}
                </p>
              </div>
              
              {botStatus.qrCode && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 w-full flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-full items-center justify-center">1</span>
                    افتح واتساب في هاتفك
                  </div>
                  <div className="relative p-3 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-100 dark:ring-white">
                    <img
                      src={botStatus.qrCode}
                      alt="WhatsApp Auth"
                      className="w-44 h-44 block rounded-lg contrast-125"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
