import { ActionResponse } from "./types";

/**
 * A wrapper to ensure all server actions return a consistent response format
 * and handle unexpected errors gracefully.
 */
export async function safeAction<T>(
    action: () => Promise<T>
): Promise<ActionResponse<T>> {
    try {
        const result = await action();
        return {
            success: true,
            data: result
        };
    } catch (error: any) {
        console.error("Action Error:", error);

        // Handle specific error types if needed (Prisma, Auth, etc)
        const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع";

        return {
            success: false,
            error: message,
            message: "فشلت العملية، يرجى المحاولة مرة أخرى"
        };
    }
}
