import type { EnrollmentState } from "@/components/sisu/EnrollmentStateBadge"

export type CompletionMethod = "assignments_only" | "exam_only" | "assignments_and_exam"

export type CourseType = "compulsory" | "optional"

export interface CourseItem {
  id: string
  title: string
  description?: string
  type: "lecture" | "assignment" | "exam"
  dayOffset: number
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  category: string
  completionMethod: CompletionMethod
  description: string
  learningOutcomes: string
  teachingPeriodStart: number
  teachingPeriodEnd: number
  courseType: CourseType
  items: CourseItem[]
}

export interface CourseWithState extends Course {
  enrollmentState: EnrollmentState
  grade?: string
}

export const completionMethodLabels: Record<CompletionMethod, string> = {
  assignments_only: "Assignments only",
  exam_only: "Exam only",
  assignments_and_exam: "Assignments and Exam",
}
