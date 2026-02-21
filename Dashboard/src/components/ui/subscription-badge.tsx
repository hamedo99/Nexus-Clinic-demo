"use client";

interface SubscriptionBadgeProps {
    status?: "ACTIVE" | "EXPIRED" | "TRIAL" | "DISABLED" | string;
}

export function SubscriptionBadge({ status }: SubscriptionBadgeProps) {
    const getStyles = () => {
        switch (status) {
            case "ACTIVE":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "EXPIRED":
                return "bg-red-50 text-red-700 border-red-200";
            case "DISABLED":
                return "bg-gray-100 text-gray-700 border-gray-300";
            default: // TRIAL
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    };

    const getLabel = () => {
        switch (status) {
            case "ACTIVE":
                return "نشط";
            case "EXPIRED":
                return "منتهي";
            case "DISABLED":
                return "معطل";
            default: // TRIAL
                return "تجريبي";
        }
    };

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStyles()}`}>
            {getLabel()}
        </span>
    );
}
