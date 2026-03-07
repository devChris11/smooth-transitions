"use client"

import { BookOpen, FileText, ClipboardList } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { CourseWithState, CourseItem } from "@/lib/sisu/types"
import { completionMethodLabels } from "@/lib/sisu/types"

interface CompletionMethodModalProps {
  course: CourseWithState | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function groupItemsByType(items: CourseItem[]) {
  const lectures = items.filter((item) => item.type === "lecture")
  const assignments = items.filter((item) => item.type === "assignment")
  const exams = items.filter((item) => item.type === "exam")
  return { lectures, assignments, exams }
}

function ItemIcon({ type }: { type: CourseItem["type"] }) {
  switch (type) {
    case "lecture":
      return <BookOpen className="h-4 w-4" />
    case "assignment":
      return <ClipboardList className="h-4 w-4" />
    case "exam":
      return <FileText className="h-4 w-4" />
  }
}

export function CompletionMethodModal({
  course,
  isOpen,
  onClose,
  onConfirm,
}: CompletionMethodModalProps) {
  if (!course) return null

  const { lectures, assignments, exams } = groupItemsByType(course.items)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-full overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-card-foreground">
            Completion Method
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review what is required to complete this course
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{course.name}</p>

        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-4 text-sm font-medium text-card-foreground">
            Method 1 — {completionMethodLabels[course.completionMethod]}
          </p>

          <div className="space-y-6">
            {/* Lectures */}
            {lectures.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Lectures
                </h4>
                <ul className="space-y-2 border-l-2 border-border pl-4">
                  {lectures.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2">
                      <span className="text-sm text-card-foreground">{item.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Day {item.dayOffset}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assignments */}
            {assignments.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  Assignments
                </h4>
                <ul className="space-y-3 border-l-2 border-border pl-4">
                  {assignments.map((item) => (
                    <li key={item.id}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-card-foreground">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Due Day {item.dayOffset}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exams */}
            {exams.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Exams
                </h4>
                <ul className="space-y-3 border-l-2 border-border pl-4">
                  {exams.map((item) => (
                    <li key={item.id}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-card-foreground">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Due Day {item.dayOffset}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Confirm Enrollment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
