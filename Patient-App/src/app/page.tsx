import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const firstDoctor = await prisma.doctor.findFirst({
    select: { slug: true }
  });

  if (firstDoctor?.slug) {
    redirect(`/doctors/${firstDoctor.slug}`);
  }

  // Fallback or show list
  return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">No doctors found.</div>
}
