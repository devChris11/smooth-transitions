import { cn } from "@/lib/utils"

export type EnrollmentState = "not_enrolled" | "pending" | "enrolled" | "completed"

interface EnrollmentStateBadgeProps {
  state: EnrollmentState
  className?: string
}

const stateConfig: Record<EnrollmentState, { label: string; className: string }> = {
  not_enrolled: {
    label: "Not Enrolled",
    className: "bg-muted text-muted-foreground",
  },
  pending: {
    label: "Pending",
    className: "bg-[#ae4c1b]/10 text-[#ae4c1b]",
  },
  enrolled: {
    label: "Enrolled",
    className: "bg-[#2d6b25]/10 text-[#2d6b25]",
  },
  completed: {
    label: "Completed",
    className: "bg-primary text-primary-foreground",
  },
}

export function EnrollmentStateBadge({ state, className }: EnrollmentStateBadgeProps) {
  const config = stateConfig[state]

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
