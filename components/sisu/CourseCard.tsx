"use client"

import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CourseWithState } from "@/lib/sisu/types"
import { EnrollmentStateBadge } from "@/components/sisu/EnrollmentStateBadge"

interface CourseCardProps {
  course: CourseWithState
  onClick: () => void
  showCategoryPill?: boolean
}

export function CourseCard({ course, onClick, showCategoryPill = true }: CourseCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-xl border border-border bg-card p-4 text-left transition-all",
        "hover:border-muted-foreground/30 hover:shadow-md"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "mb-3 flex items-start justify-between gap-2",
          !showCategoryPill && "justify-end"
        )}
      >
        {showCategoryPill && (
          <span 
            title={course.category}
            className="flex min-h-[24px] items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium leading-tight text-muted-foreground max-w-[120px]"
          >
            <span className="truncate">
              {course.category}
            </span>
          </span>
        )}
        <EnrollmentStateBadge state={course.enrollmentState} className="shrink-0 whitespace-nowrap" />
      </div>

      {/* Course Name & Code */}
      <h3 className="mb-1 text-base font-semibold text-card-foreground">
        {course.name}
      </h3>
      <p className="text-sm text-muted-foreground">{course.code}</p>

      {/* Divider */}
      <div className="my-3 h-px w-full bg-border" />

      {/* Footer */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{course.credits} credits</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {course.enrollmentState === "completed" && course.grade ? (
            <span className="font-medium text-[#2d6b25]">Grade: {course.grade}</span>
          ) : (
            `Day ${course.teachingPeriodStart} – Day ${course.teachingPeriodEnd}`
          )}
        </p>
      </div>
    </button>
  )
}
