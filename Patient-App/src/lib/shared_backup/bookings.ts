import { prisma } from "./db";

/**
 * Fetches global booking configuration from settings.
 */
export async function fetchBookingConfig() {
    try {
        const keys = ["working_hours", "patients_per_hour", "consultation_price", "slot_duration"];
        const settings = await prisma.setting.findMany({
            where: { key: { in: keys } },
        });

        const configMap: Record<string, any> = {};
        settings.forEach(s => configMap[s.key] = s.value);

        return {
            workingHours: configMap["working_hours"] || { start: 14, end: 21 },
            patientsPerHour: typeof configMap["patients_per_hour"] === 'number' ? configMap["patients_per_hour"] : 4,
            consultationPrice: typeof configMap["consultation_price"] === 'number' ? configMap["consultation_price"] : 25000,
            slotDuration: typeof configMap["slot_duration"] === 'number' ? configMap["slot_duration"] : 20
        };
    } catch (error) {
        console.error("fetchBookingConfig Error:", error);
        return {
            workingHours: { start: 14, end: 21 },
            patientsPerHour: 4,
            consultationPrice: 25000,
            slotDuration: 20
        };
    }
}

/**
 * Calculates availability for a given month and doctor.
 */
export async function fetchMonthAvailability(
    year: number,
    month: number,
    doctorId?: string,
    options?: {
        patientsPerHour?: number;
        workingHours?: { start: number, end: number };
        slotDuration?: number;
    }
) {
    try {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Fetch blocked dates
        const blockedTimes = await prisma.blockedTime.findMany({
            where: {
                ...(doctorId ? { doctorId } : {}),
                OR: [
                    { startTime: { gte: startOfMonth, lte: endOfMonth } },
                    { endTime: { gte: startOfMonth, lte: endOfMonth } },
                    { startTime: { lte: startOfMonth }, endTime: { gte: endOfMonth } }
                ]
            },
        });

        // Fetch appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                ...(doctorId ? { doctorId } : {}),
                startTime: { gte: startOfMonth, lte: endOfMonth },
                status: { not: "CANCELLED" },
            },
        });

        // Use provided options or fetch defaults
        let config = options;

        if (!config) {
            const globalConfig = await fetchBookingConfig();
            if (doctorId) {
                const doctor = await prisma.doctor.findUnique({
                    where: { id: doctorId },
                    select: { patientsPerHour: true, workingHours: true }
                });
                config = {
                    patientsPerHour: doctor?.patientsPerHour || globalConfig.patientsPerHour,
                    workingHours: (doctor?.workingHours as any) || globalConfig.workingHours,
                    slotDuration: globalConfig.slotDuration
                };
            } else {
                config = globalConfig;
            }
        }

        const { patientsPerHour, workingHours } = config;

        const bookedSlots: Record<string, Record<string, number>> = {};
        const dailyCounts: Record<string, number> = {};
        const exactBookedSlots: Record<string, string[]> = {};

        appointments.forEach(app => {
            const date = new Date(app.startTime);
            const year = date.getFullYear();
            const monthStr = String(date.getMonth() + 1).padStart(2, '0');
            const dayStrPart = String(date.getDate()).padStart(2, '0');
            const dayStr = `${year}-${monthStr}-${dayStrPart}`;
            const hour = date.getHours();

            if (!bookedSlots[dayStr]) bookedSlots[dayStr] = {};
            if (!bookedSlots[dayStr][hour]) bookedSlots[dayStr][hour] = 0;
            if (!exactBookedSlots[dayStr]) exactBookedSlots[dayStr] = [];

            const m = date.getMinutes();
            const timeStr = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            exactBookedSlots[dayStr].push(timeStr);

            bookedSlots[dayStr][hour]++;
            dailyCounts[dayStr] = (dailyCounts[dayStr] || 0) + 1;
        });

        const fullyBookedDates: string[] = [];
        Object.keys(dailyCounts).forEach(day => {
            let isFull = true;
            for (let h = (workingHours?.start || 14); h < (workingHours?.end || 21); h++) {
                const count = bookedSlots[day]?.[h] || 0;
                if (count < (patientsPerHour || 4)) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) fullyBookedDates.push(day);
        });

        const fullSlots: Record<string, number[]> = {};
        Object.keys(bookedSlots).forEach(day => {
            fullSlots[day] = [];
            for (let h = (workingHours?.start || 14); h < (workingHours?.end || 21); h++) {
                if ((bookedSlots[day][h] || 0) >= (patientsPerHour || 4)) {
                    fullSlots[day].push(h);
                }
            }
        });

        return {
            blockedPeriods: blockedTimes.map(b => ({ start: b.startTime, end: b.endTime, reason: b.reason })),
            fullyBookedDates,
            fullSlots,
            exactBookedSlots
        };
    } catch (error) {
        console.error("fetchMonthAvailability Error:", error);
        return { blockedPeriods: [], fullyBookedDates: [], fullSlots: {}, exactBookedSlots: {} };
    }
}

/**
 * Centralized logic for creating a booking with all validations.
 */
export async function validateAndCreateBooking(data: {
    patientName: string;
    patientPhone: string;
    startTime: Date;
    doctorId?: string;
}) {
    const { patientName, patientPhone, startTime, doctorId } = data;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parallelize independent validations for maximum throughput
    const [statusResult, config, capacityCount, blocked, conflict, duplicate] = await Promise.all([
        // 0. Subscription Check
        doctorId
            ? prisma.doctor.findUnique({ where: { id: doctorId }, select: { subscriptionStatus: true } })
            : prisma.doctor.findFirst({ select: { subscriptionStatus: true } }),

        // 1. Config Fetch
        fetchBookingConfig(),

        // 2. Capacity Check logic (pre-computation)
        (async () => {
            const hourStart = new Date(startTime);
            hourStart.setMinutes(0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hourStart.getHours() + 1);
            return prisma.appointment.count({
                where: {
                    status: { not: "CANCELLED" },
                    ...(doctorId ? { doctorId } : {}),
                    startTime: { gte: hourStart, lt: hourEnd }
                }
            });
        })(),

        // 3. Blocked Time Check
        prisma.blockedTime.findFirst({
            where: {
                ...(doctorId ? { doctorId } : {}),
                startTime: { lte: startTime },
                endTime: { gte: new Date(startTime.getTime() + 20 * 60000) } // Approximation based on default 20min
            }
        }),

        // 4. Conflicting Appointment
        prisma.appointment.findFirst({
            where: {
                status: { not: "CANCELLED" },
                ...(doctorId ? { doctorId } : {}),
                AND: [
                    { startTime: { lt: new Date(startTime.getTime() + 20 * 60000) } },
                    { endTime: { gt: startTime } }
                ]
            }
        }),

        // 5. Duplicate Prevention
        prisma.appointment.findFirst({
            where: {
                patient: { phoneNumber: patientPhone },
                ...(doctorId ? { doctorId } : {}),
                status: { not: "CANCELLED" },
                startTime: { gte: today }
            }
        })
    ]);

    const subscriptionStatus = statusResult?.subscriptionStatus || "ACTIVE";
    if (subscriptionStatus === "EXPIRED" || subscriptionStatus === "DISABLED") {
        return { success: false, message: "عذراً، لا يمكن إتمام الحجز. اشتراك العيادة منتهي أو معطل." };
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + config.slotDuration);

    if (!isWithinWorkingHours(startTime, config.workingHours)) {
        return { success: false, message: "خارج ساعات العمل" };
    }

    if (capacityCount >= config.patientsPerHour) {
        return { success: false, message: "عذراً، تم الوصول للحد الأقصى من الحجوزات في هذه الساعة." };
    }

    if (blocked) {
        return { success: false, message: "عذراً، العيادة مغلقة في هذا الوقت." };
    }

    if (conflict) {
        return { success: false, message: "عذراً، هذا الموعد محجوز مسبقاً." };
    }

    if (duplicate) {
        return { success: false, message: "عذراً، لديك حجز نشط مسبقاً." };
    }

    try {
        const patient = await prisma.patient.upsert({
            where: { phoneNumber: patientPhone },
            update: { fullName: patientName },
            create: { fullName: patientName, phoneNumber: patientPhone, doctorId: doctorId }
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                startTime,
                endTime,
                status: "PENDING",
                doctorId: doctorId
            }
        });

        return { success: true, data: appointment };
    } catch (error) {
        console.error("validateAndCreateBooking Error:", error);
        return { success: false, message: "حدث خطأ في قاعدة البيانات." };
    }
}

function isWithinWorkingHours(startTime: Date, workingHours: { start: number, end: number }) {
    const hour = startTime.getHours();
    return hour >= workingHours.start && hour < workingHours.end;
}

async function isHourCapacityReached(startTime: Date, patientsPerHour: number, doctorId?: string) {
    const hourStart = new Date(startTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourStart.getHours() + 1);

    const count = await prisma.appointment.count({
        where: {
            status: { not: "CANCELLED" },
            ...(doctorId ? { doctorId } : {}),
            startTime: { gte: hourStart, lt: hourEnd }
        }
    });
    return count >= patientsPerHour;
}

async function isTimeBlocked(startTime: Date, endTime: Date, doctorId?: string) {
    const blocked = await prisma.blockedTime.findFirst({
        where: {
            ...(doctorId ? { doctorId } : {}),
            startTime: { lte: startTime },
            endTime: { gte: endTime }
        }
    });
    return !!blocked;
}

async function hasConflictingAppointment(startTime: Date, endTime: Date, doctorId?: string, excludeId?: string) {
    const conflict = await prisma.appointment.findFirst({
        where: {
            status: { not: "CANCELLED" },
            ...(doctorId ? { doctorId } : {}),
            ...(excludeId ? { id: { not: excludeId } } : {}),
            AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } }
            ]
        }
    });
    return !!conflict;
}
