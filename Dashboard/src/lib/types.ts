export * from "./shared-logic/types";

export interface DashboardStats {
    clinicStatus: any;
    appointments: any[];
    stats: {
        newPatients: number;
        pending: number;
        todayTotal: number;
        totalDoctors: number;
        platformTotalAppointments: number;
        platformTotalPatients: number;
        isGlobal: boolean;
    };
}
