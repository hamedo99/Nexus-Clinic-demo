import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  try {
    const firstDoctor = await prisma.doctor.findFirst({
      select: { slug: true }
    });

    if (firstDoctor?.slug) {
      redirect(`/doctors/${firstDoctor.slug}`);
    }
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error("Home page Prisma error:", error);
  }

  // Fallback or show list
  return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">No doctors found. Please check database connection.</div>
}
