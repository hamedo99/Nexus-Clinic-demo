"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Generic caching hook
export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    initialData?: T,
    revalidateInterval: number = 60000
) {
    const [data, setData] = useState<T | undefined>(initialData);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    const mutate = useCallback((newData: T) => {
        setData(newData);
        sessionStorage.setItem(key, JSON.stringify({
            data: newData,
            timestamp: Date.now()
        }));
    }, [key]);

    const refresh = useCallback(async () => {
        try {
            const newData = await fetcher();
            if (isMounted.current) {
                setData(newData);
                setLoading(false);
                sessionStorage.setItem(key, JSON.stringify({
                    data: newData,
                    timestamp: Date.now()
                }));
            }
        } catch (err) {
            if (isMounted.current) {
                console.error(`Failed to refresh data for ${key}`, err);
                setError("Failed to update data");
            }
        }
    }, [fetcher, key]);

    useEffect(() => {
        isMounted.current = true;

        const initFetch = async () => {
            // Check cache first
            try {
                const cached = sessionStorage.getItem(key);
                if (cached) {
                    const { data: cachedData, timestamp } = JSON.parse(cached);

                    if (!data) {
                        setData(cachedData);
                        setLoading(false);
                    }

                    // If cache is fresh (less than 1 minute ?), don't refetch
                    // User wants "fast", so show cache immediately, then fetch in background basically SWR
                    // But if it's very fresh, maybe skip network?
                    // Let's stick to "Stale-While-Revalidate": Show cache, then always fetch fresh unless super fresh (< 10s)
                    if (Date.now() - timestamp < 10000 && !initialData) {
                        return;
                    }
                }
            } catch (e) {
                // Ignore cache read errors
            }

            // Fetch fresh data
            refresh();
        };

        if (!initialData) {
            initFetch();
        }

        const intervalId = setInterval(refresh, revalidateInterval);

        return () => {
            isMounted.current = false;
            clearInterval(intervalId);
        };
    }, [key, refresh, initialData, revalidateInterval]); // Removed data dependency to avoid loops

    return { data, loading, error, mutate, refresh };
}
