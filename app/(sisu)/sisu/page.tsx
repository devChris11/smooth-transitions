"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { EnrollmentStateBadge } from "@/components/sisu/EnrollmentStateBadge"
import { CourseDetailModal } from "@/components/sisu/CourseDetailModal"
import {
  fetchStudent,
  fetchDegreeProgramme,
  fetchEnrollments,
  fetchCourses,
  unenrollFromCourse,
} from "@/lib/sisu/queries"
import type { CourseWithState } from "@/lib/sisu/types"
import type { EnrollmentState } from "@/components/sisu/EnrollmentStateBadge"

function CourseListCard({
  course,
  onClick,
}: {
  course: CourseWithState
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-card-foreground">{course.name}</h3>
        <p className="text-sm text-muted-foreground">
          {course.code} · {course.credits} credits
        </p>
      </div>
      <div className="flex items-center gap-3">
        <EnrollmentStateBadge state={course.enrollmentState} />
        <a
          href="#"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Go to Moodle
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}

export default function SisuHomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithState[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseWithState | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  async function loadData() {
    const student = await fetchStudent()
    if (!student) {
      setError("Failed to load student")
      return
    }

    const degree = await fetchDegreeProgramme()
    if (!degree) {
      setError("Failed to load degree programme")
      return
    }

    const enrollments = await fetchEnrollments(student.id)
    if (enrollments.length === 0) {
      setEnrolledCourses([])
      setStudentId(student.id)
      return
    }

    const courses = await fetchCourses(degree.id)
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))
    const enrolled: CourseWithState[] = courses
      .filter((c) => enrolledCourseIds.has(c.id))
      .map((c) => ({
        ...c,
        enrollmentState: "enrolled" as EnrollmentState,
      }))
    setEnrolledCourses(enrolled)
    setStudentId(student.id)
  }

  useEffect(() => {
    async function init() {
      try {
        await loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCourseClick = (course: CourseWithState) => {
    setSelectedCourse(course)
    setIsDetailModalOpen(true)
  }

  const handleUnenroll = async () => {
    if (!selectedCourse || !studentId) return

    const result = await unenrollFromCourse(studentId, selectedCourse.id)
    if (!result.success) {
      console.error(result.error)
      return
    }

    setEnrolledCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id))
    setIsDetailModalOpen(false)
    setSelectedCourse(null)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCourse(null)
  }

  const hasEnrolled = enrolledCourses.length > 0

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Home</h1>
      <p className="mt-2 text-lg text-muted-foreground">Welcome back, Mikael</p>

      <div className="mt-8 space-y-8">
        {/* Active Enrollments */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Active Enrollments
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Courses you are currently enrolled in
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "↺ Refresh"}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {hasEnrolled ? (
              enrolledCourses.map((course) => (
                <CourseListCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You have no active enrollments yet.{" "}
                  <Link
                    href="/structure-of-studies"
                    className="text-primary hover:underline"
                  >
                    Head to Structure of Studies
                  </Link>{" "}
                  to enroll in your courses.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <CourseDetailModal
        course={selectedCourse}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEnroll={() => {}}
        onUnenroll={handleUnenroll}
      />
    </div>
  )
}
