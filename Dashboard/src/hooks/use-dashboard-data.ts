"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { getDashboardStats } from "@/lib/actions";
import { useDashboardStore } from "@/lib/store";
import { DashboardStats } from "@/lib/types";

export function useDashboardData(initialData?: DashboardStats, filterDoctorId?: string) {
    const key = filterDoctorId || 'ALL';
    // Use specific selectors to prevent re-renders on irrelevant store changes
    const storedData = useDashboardStore(useCallback(state => state.data[key], [key]));
    const setData = useDashboardStore(state => state.setData);

    const isMounted = useRef(true);
    const [loading, setLoading] = useState(!storedData && !initialData);

    // Initialize store on first mount if missing and initial data provided
    useEffect(() => {
        if (!useDashboardStore.getState().data['ALL'] && initialData && !filterDoctorId) {
            useDashboardStore.getState().setData('ALL', initialData);
        }
    }, [initialData, filterDoctorId]);

    const refresh = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const newData = await getDashboardStats(filterDoctorId);
            if (isMounted.current && newData) {
                setData(key, newData);
            }
        } catch (err) {
            if (isMounted.current) {
                console.error("Failed to refresh dashboard data", err);
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [filterDoctorId, key, setData]);

    useEffect(() => {
        isMounted.current = true;
        // Background SWR fetch - only show loading if we don't have data yet
        refresh(!storedData && !initialData);

        const intervalId = setInterval(() => refresh(false), 60000); // 1-minute automated polling for freshness

        return () => {
            isMounted.current = false;
            clearInterval(intervalId);
        };
    }, [refresh, !!storedData, !!initialData]);

    // Derived properties for optimistic compatibility
    const data = useMemo(() => storedData || (key === 'ALL' ? initialData : undefined), [storedData, initialData, key]);

    // Abstract mutate to just trigger a refresh (since Zustand optimistic covers it)
    const mutate = useCallback((newData: DashboardStats) => {
        setData(key, newData);
    }, [key, setData]);

    return {
        data,
        loading,
        error: null,
        mutate,
        refresh
    };
}
