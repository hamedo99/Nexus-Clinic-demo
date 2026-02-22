import { create } from 'zustand';
import { DashboardStats } from './types';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'appointment' | 'reminder' | 'success' | 'info';
    time: string;
    read: boolean;
}

interface DashboardStore {
    data: Record<string, DashboardStats>; // Keyed by doctorId or 'ALL'
    notifications: Notification[];
    setData: (key: string, data: DashboardStats) => void;
    updateAppointmentStatus: (key: string, id: string, status: "CONFIRMED" | "CANCELLED") => void;
    addAppointment: (key: string, newAppointment: any) => void;
    addNotification: (n: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    data: {},
    notifications: [],
    setData: (key: string, data: DashboardStats) => set((state: DashboardStore) => ({
        data: { ...state.data, [key]: data }
    })),
    updateAppointmentStatus: (key: string, id: string, newStatus: "CONFIRMED" | "CANCELLED") => set((state: DashboardStore) => {
        const currentData = state.data[key];
        if (!currentData) return state;

        const newData = { ...currentData };
        const originalAppointment = newData.appointments.find((apt: any) => apt.id === id);
        if (!originalAppointment) return state;

        const originalStatus = originalAppointment.status;
        newData.appointments = newData.appointments.map((apt: any) => apt.id === id ? { ...apt, status: newStatus } : apt);

        const newStats = { ...newData.stats };
        if (originalStatus === "PENDING" && newStatus === "CONFIRMED") {
            newStats.pending = Math.max(0, newStats.pending - 1);
        } else if (originalStatus === "CONFIRMED" && newStatus === "CANCELLED") {
            newStats.todayTotal = Math.max(0, newStats.todayTotal - 1);
        } else if (originalStatus === "PENDING" && newStatus === "CANCELLED") {
            newStats.pending = Math.max(0, newStats.pending - 1);
            newStats.todayTotal = Math.max(0, newStats.todayTotal - 1);
        }

        newData.stats = newStats;

        return {
            data: { ...state.data, [key]: newData }
        };
    }),
    addAppointment: (key: string, newAppointment: any) => set((state: DashboardStore) => {
        const currentData = state.data[key];
        if (!currentData) return state;

        const newData = { ...currentData };
        newData.appointments = [...newData.appointments, newAppointment].sort((a: any, b: any) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const newStats = { ...newData.stats };
        newStats.todayTotal += 1;
        if (newAppointment.status === "PENDING") newStats.pending += 1;

        newData.stats = newStats;

        return {
            data: { ...state.data, [key]: newData }
        };
    }),
    addNotification: (n) => set((state) => ({
        notifications: [
            {
                ...n,
                id: Math.random().toString(36).substring(7),
                time: new Date().toISOString(),
                read: false
            },
            ...state.notifications
        ].slice(0, 20) // Keep last 20
    })),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
    clearNotifications: () => set({ notifications: [] })
}));
