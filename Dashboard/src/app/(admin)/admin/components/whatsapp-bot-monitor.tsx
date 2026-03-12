"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCcw, Wifi, WifiOff } from "lucide-react";

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
    <Card className="shadow-sm border-blue-100 dark:border-blue-900 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-blue-900/10" dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/20">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
          <Bot className="w-5 h-5 ml-1" />
          وحدة التحكم في بوت واتساب
        </CardTitle>
        <button
          onClick={checkBotStatus}
          className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-full transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {botStatus.status === "loading" && (
            <div className="flex flex-col items-center gap-3 animate-pulse text-muted-foreground">
              <Bot className="w-12 h-12 opacity-20" />
              <p>التحقق من اتصال البوت...</p>
            </div>
          )}

          {botStatus.status === "connected" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full border border-green-200 dark:border-green-800 relative z-10">
                  <Wifi className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-green-700 dark:text-green-400">البوت نشط ومتصل</h4>
                <p className="text-sm text-muted-foreground">بوت الواتساب يعمل بشكل سليم وجاهز لإرسال الرسائل.</p>
              </div>
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                النظام سليم
              </Badge>
            </div>
          )}

          {(botStatus.status === "disconnected" || botStatus.status === "error") && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full border border-red-200 dark:border-red-800">
                <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-red-600 dark:text-red-400">انقطع اتصال البوت</h4>
                <p className="text-sm text-muted-foreground">
                  {botStatus.error || "يجب إعادة مصادقة البوت باستخدام واتساب ويب."}
                </p>
              </div>
              
              {botStatus.qrCode && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-sm border">
                  <p className="text-xs text-muted-foreground font-medium mb-3">امسح رمز QR الخاص هذا باستخدام تطبيق الواتساب</p>
                  <img
                    src={botStatus.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 block rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
