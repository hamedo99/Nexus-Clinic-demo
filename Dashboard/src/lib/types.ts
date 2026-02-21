export * from "@nexus/shared";

export type ActionResponse<T = any> = { success: true; data: T; message?: string } | { success: false; error?: string; message?: string };

// Dashboard specific types if any
export interface DashboardStats {
    clinicStatus: {
        isOpen: boolean;
        reason: string | null;
    };
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
    chartData?: Array<{
        date: string;
        count: number;
    }>;
}
