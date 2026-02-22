import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Resolves a media path to a full URL if it's a relative path.
 */
export function resolveMediaPath(path: string | null | undefined): string {
    const fallback = "/doctors/profile.jpg";
    const placeholder = "/doctor-placeholder.svg";

    if (!path || path === "" || path === placeholder || path === "/doctor-placeholder.png") {
        return fallback;
    }

    // Strictly check for absolute URLs (Supabase, external, etc.)
    // If it starts with http or https, we MUST return it exactly as-is.
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
        return path;
    }


    // Determine Base URL: 
    // 1. NEXT_PUBLIC_BASE_URL (Preferred for production/custom)
    // 2. NEXT_PUBLIC_DASHBOARD_URL (Fallback)
    // 3. Fallback to a production URL if VERCEL is true, else localhost
    const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        || process.env.NEXT_PUBLIC_DASHBOARD_URL
        || (isProd ? "https://nexus-clinic-demo.vercel.app" : "http://localhost:3000");

    // Assets that are local to the Patient-App (old structure)
    if (path.startsWith("/doctors/") || path.startsWith("/cases/")) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
}
