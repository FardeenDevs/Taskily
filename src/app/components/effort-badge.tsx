"use client";

import { type Effort } from "@/lib/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

interface EffortBadgeProps {
    effort: Effort;
}

const effortMap: Record<Effort, { variant: BadgeProps['variant'], label: string }> = {
    "E1": { variant: "p1", label: "E1" },
    "E2": { variant: "p2", label: "E2" },
    "E3": { variant: "p3", label: "E3" },
    "E4": { variant: "p4", label: "E4" },
    "E5": { variant: "p5", label: "E5" },
}

export function EffortBadge({ effort }: EffortBadgeProps) {
    const { variant, label } = effortMap[effort];
    return <Badge variant={variant}>{label}</Badge>
}
