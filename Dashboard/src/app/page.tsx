import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <main className="flex max-w-4xl flex-col items-center gap-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-primary">
          نظام عيادة نيكسوس
          <br />
          <span className="text-2xl text-foreground/80 sm:text-3xl">NexusClinic OS (نسخة العراق)</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          نظام إدارة وتنسيق المواعيد الطبية عالي الدقة.
          <br />
          التعقيد في الخلفية، والبساطة على الشاشة.
          <br />
          <span className="text-sm mt-2 block">الحجز الإلكتروني متاح عبر الموقع الرسمي</span>
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              لوحة التحكم (للأطباء)
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
