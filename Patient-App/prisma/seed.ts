import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const doctor = await prisma.doctor.upsert({
        where: { slug: 'doctor-mustafa' },
        update: {},
        create: {
            id: 'doctor-mustafa',
            name: 'د. مصطفى صباح',
            doctor_name: 'د. مصطفى صباح سردار',
            specialty: 'جراحة العظام',
            specialty_title: 'استشاري جراحة العظام والمفاصل والكسور',
            slug: 'doctor-mustafa',
            years_of_experience: 15,
            profile_image_path: '/doctors/profile.jpg',
            consultationPrice: 25000,
            patientsPerHour: 4,
            workingHours: { start: 14, end: 21 }
        },
    })
    console.log('Seeded doctor:', doctor)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
