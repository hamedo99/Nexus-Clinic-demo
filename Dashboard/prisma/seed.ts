import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@nexus.clinic' }
    });

    if (!existingAdmin) {
        const newAdmin = await prisma.user.create({
            data: {
                email: 'admin@nexus.clinic',
                password: 'password123',
                name: 'System Admin',
                role: 'ADMIN' // or depending on the enum: Role.ADMIN
            }
        });
        console.log("Admin created:", newAdmin);
    } else {
        console.log("Admin already exists!");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
