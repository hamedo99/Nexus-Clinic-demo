import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal'
})

export const metadata: Metadata = {
  title: 'حجز طبيب',
  description: 'منصة حجز المواعيد الطبية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn(tajawal.className, "min-h-screen bg-slate-950 font-sans antialiased text-white")}>
        <div className="animate-page">
          {children}
        </div>
      </body>
    </html>
  )
}
