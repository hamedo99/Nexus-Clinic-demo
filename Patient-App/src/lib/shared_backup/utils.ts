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
    if (!path || path === "/doctor-placeholder.png") return fallback;
    if (path.startsWith("http") || path.startsWith("data:")) return path;

    const baseUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "";

    // Assets that are local to the Patient-App (old structure)
    if (path.startsWith("/doctors/") || path.startsWith("/cases/")) return path;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
}
