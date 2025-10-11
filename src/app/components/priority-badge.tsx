"use client";

import { type Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
    priority: Priority;
    className?: string;
}

const priorityColorMap: Record<Priority, string> = {
    "P1": "text-green-500",
    "P2": "text-green-600 dark:text-green-500",
    "P3": "text-yellow-600 dark:text-yellow-500",
    "P4": "text-orange-600 dark:text-orange-500",
    "P5": "text-red-600 dark:text-red-500",
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    return (
        <span className={cn("text-xs font-bold", priorityColorMap[priority], className)}>
            {priority}
        </span>
    )
}
