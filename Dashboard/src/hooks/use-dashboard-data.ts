"use client";

import { useEffect, useCallback } from "react";
import useSWR from "swr";
import { getDashboardStats } from "@/lib/actions";
import { useDashboardStore } from "@/lib/store";
import { DashboardStats } from "@/lib/types";

export function useDashboardData(initialData?: DashboardStats, filterDoctorId?: string) {
    const key = filterDoctorId || 'ALL';
    const setData = useDashboardStore(state => state.setData);

    // Sync initial data to the store on mount so other components have baseline data
    useEffect(() => {
        if (initialData) {
            setData(key, initialData);
        }
    }, [initialData, key, setData]);

    // Use SWR for fetching, caching, and revalidation
    const { data, error, mutate, isLoading } = useSWR(
        ['dashboardStats', key],
        async ([, doctorId]) => {
            const id = doctorId === 'ALL' ? undefined : doctorId;
            const newData = await getDashboardStats(id);
            if (newData) {
                // Keep the global state synced for background tasks (reminders, notifications)
                setData(doctorId, newData);
            }
            return newData;
        },
        {
            fallbackData: initialData,
            refreshInterval: 60000, // 1 minute background automated polling
            revalidateOnFocus: true, // Fetch instantly when window gets focus
            revalidateIfStale: false,
        }
    );

    // Abstract mutate to update both SWR cache optimistically and Zustand global store
    const customMutate = useCallback((optimisticData: DashboardStats) => {
        setData(key, optimisticData);
        mutate(optimisticData, false); // Update SWR without triggering an immediate re-fetch
    }, [key, setData, mutate]);

    return {
        data: data,
        loading: isLoading,
        error: error,
        mutate: customMutate,
        refresh: () => mutate()
    };
}
