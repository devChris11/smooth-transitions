"use client"

import { BookOpen, Tag, FileText, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { CourseWithState } from "@/lib/sisu/types"
import { completionMethodLabels } from "@/lib/sisu/types"
import { EnrollmentStateBadge } from "@/components/sisu/EnrollmentStateBadge"

interface CourseDetailModalProps {
  course: CourseWithState | null
  isOpen: boolean
  onClose: () => void
  onEnroll: () => void
}

export function CourseDetailModal({
  course,
  isOpen,
  onClose,
  onEnroll,
}: CourseDetailModalProps) {
  if (!course) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto bg-card p-0 sm:max-w-4xl">
        {/* Header */}
        <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-card-foreground">
                {course.name}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{course.code}</p>
                <EnrollmentStateBadge state={course.enrollmentState} />
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
          {/* Left Column */}
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                About this course
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                Learning outcomes
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {course.learningOutcomes}
              </p>
            </section>
          </div>

          {/* Right Column */}
          <div className="sticky top-0 self-start space-y-4 rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="text-sm font-medium text-card-foreground">{course.credits}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium text-card-foreground">{course.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Completion method</p>
                <p className="text-sm font-medium text-card-foreground">
                  {completionMethodLabels[course.completionMethod]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Teaching period</p>
                <p className="text-sm font-medium text-card-foreground">
                  Day {course.teachingPeriodStart} – Day {course.teachingPeriodEnd}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border p-6">
          {course.enrollmentState === "not_enrolled" && (
            <Button
              onClick={onEnroll}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Enroll in Course
            </Button>
          )}
          {course.enrollmentState === "enrolled" && (
            <Button disabled className="bg-muted text-muted-foreground">
              Already Enrolled
            </Button>
          )}
          {course.enrollmentState === "pending" && (
            <Button disabled className="bg-muted text-muted-foreground">
              Enrollment Pending
            </Button>
          )}
          {course.enrollmentState === "completed" && course.grade && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Final Grade:</span>
              <span className="text-lg font-bold text-[#2d6b25]">{course.grade}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
