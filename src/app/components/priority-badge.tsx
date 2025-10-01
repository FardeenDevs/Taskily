"use client";

import { type Priority } from "@/lib/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface PriorityBadgeProps {
    priority: Priority;
}

const priorityMap: Record<Priority, { variant: BadgeProps['variant'], label: string }> = {
    "P1": { variant: "p1", label: "P1" },
    "P2": { variant: "p2", label: "P2" },
    "P3": { variant: "p3", label: "P3" },
    "P4": { variant: "p4", label: "P4" },
    "P5": { variant: "p5", label: "P5" },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const { variant, label } = priorityMap[priority];
    return <Badge variant={variant}>{label}</Badge>
}
