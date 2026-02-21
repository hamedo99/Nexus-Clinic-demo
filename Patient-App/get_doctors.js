const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.doctors.findMany({ select: { id: true, slug: true, name: true, doctor_name: true } });

    if (doctors.length === 0) {
        console.log("No doctors found in the database.");
        return;
    }

    console.log("Doctor Booking Links:");
    console.log("-----------------------");
    doctors.forEach(doc => {
        const name = doc.doctor_name || doc.name;
        const path = doc.slug || doc.id;
        console.log(`${name}:`);
        console.log(`http://localhost:3000/doctors/${path}/book`);
        console.log("-----------------------");
    });
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
