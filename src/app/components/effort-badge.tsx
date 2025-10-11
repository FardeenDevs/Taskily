"use client";

import { type Effort } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EffortBadgeProps {
    effort: Effort;
    className?: string;
}

const effortColorMap: Record<Effort, string> = {
    "E1": "text-green-500",
    "E2": "text-green-600 dark:text-green-500",
    "E3": "text-yellow-600 dark:text-yellow-500",
    "E4": "text-orange-600 dark:text-orange-500",
    "E5": "text-red-600 dark:text-red-500",
}

export function EffortBadge({ effort, className }: EffortBadgeProps) {
    return (
        <span className={cn("text-xs font-bold", effortColorMap[effort], className)}>
            {effort}
        </span>
    )
}
