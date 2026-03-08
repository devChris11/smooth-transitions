"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/sisu/CourseCard"
import { CourseDetailModal } from "@/components/sisu/CourseDetailModal"
import { CompletionMethodModal } from "@/components/sisu/CompletionMethodModal"
import {
  fetchDegreeProgramme,
  fetchStudent,
  fetchCourses,
  fetchEnrollments,
  enrollInCourse,
  unenrollFromCourse,
} from "@/lib/sisu/queries"
import type { CourseWithState, Course } from "@/lib/sisu/types"
import type { EnrollmentState } from "@/components/sisu/EnrollmentStateBadge"

// Initialize courses with enrollment state
function initializeCourses(courses: Course[]): CourseWithState[] {
  return courses.map((course) => ({
    ...course,
    enrollmentState: "not_enrolled" as EnrollmentState,
  }))
}

export default function StructureOfStudiesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [degreeName, setDegreeName] = useState("")
  const [totalCredits, setTotalCredits] = useState(0)

  const [compulsoryCourseStates, setCompulsoryCourseStates] = useState<CourseWithState[]>([])
  const [optionalCourseStates, setOptionalCourseStates] = useState<CourseWithState[]>([])

  const [selectedCourse, setSelectedCourse] = useState<CourseWithState | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
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

        const courses = await fetchCourses(degree.id)
        const enrollments = await fetchEnrollments(student.id)
        const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))

        const coursesWithState: CourseWithState[] = initializeCourses(courses).map((course) =>
          enrolledCourseIds.has(course.id)
            ? { ...course, enrollmentState: "enrolled" as EnrollmentState }
            : course
        )

        const compulsory = coursesWithState.filter((c) => c.courseType === "compulsory")
        const optional = coursesWithState.filter((c) => c.courseType === "optional")

        setCompulsoryCourseStates(compulsory)
        setOptionalCourseStates(optional)
        setStudentId(student.id)
        setDegreeName(degree.name)
        setTotalCredits(degree.totalCreditsRequired)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCourseClick = (course: CourseWithState) => {
    setSelectedCourse(course)
    setIsDetailModalOpen(true)
  }

  const handleEnrollClick = () => {
    setIsDetailModalOpen(false)
    setIsCompletionModalOpen(true)
  }

  const handleConfirmEnrollment = async () => {
    if (!selectedCourse || !studentId) return

    const result = await enrollInCourse(
      studentId,
      selectedCourse.id,
      selectedCourse.completionMethod
    )
    if (!result.success) {
      console.error(result.error)
      return
    }

    // Update the enrollment state
    const updateState = (courses: CourseWithState[]) =>
      courses.map((c) =>
        c.id === selectedCourse.id ? { ...c, enrollmentState: "enrolled" as EnrollmentState } : c
      )

    if (selectedCourse.courseType === "compulsory") {
      setCompulsoryCourseStates(updateState)
    } else {
      setOptionalCourseStates(updateState)
    }

    // Update selected course for modal display
    setSelectedCourse((prev) =>
      prev ? { ...prev, enrollmentState: "enrolled" as EnrollmentState } : null
    )

    setIsCompletionModalOpen(false)
  }

  const handleUnenroll = async () => {
    if (!selectedCourse || !studentId) return

    const result = await unenrollFromCourse(studentId, selectedCourse.id)
    if (!result.success) {
      console.error(result.error)
      return
    }

    const updateState = (courses: CourseWithState[]) =>
      courses.map((c) =>
        c.id === selectedCourse.id ? { ...c, enrollmentState: "not_enrolled" as EnrollmentState } : c
      )

    if (selectedCourse.courseType === "compulsory") {
      setCompulsoryCourseStates(updateState)
    } else {
      setOptionalCourseStates(updateState)
    }

    setSelectedCourse((prev) =>
      prev ? { ...prev, enrollmentState: "not_enrolled" as EnrollmentState } : null
    )
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCourse(null)
  }

  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false)
    setIsDetailModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading courses...</p>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Degree Header */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h1 className="text-3xl font-bold text-card-foreground md:text-4xl">
          {degreeName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suomi University of Applied Sciences
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCredits} credits required
        </p>

        {/* Tabs */}
        <Tabs defaultValue="compulsory" className="mt-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="compulsory" className="data-[state=active]:bg-card">
              Compulsory Modules
            </TabsTrigger>
            <TabsTrigger value="optional" className="data-[state=active]:bg-card">
              Optional Modules
            </TabsTrigger>
          </TabsList>

          {/* Compulsory Courses */}
          <TabsContent value="compulsory" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {compulsoryCourseStates.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Optional Courses */}
          <TabsContent value="optional" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {optionalCourseStates.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEnroll={handleEnrollClick}
        onUnenroll={handleUnenroll}
      />

      {/* Completion Method Modal */}
      <CompletionMethodModal
        course={selectedCourse}
        isOpen={isCompletionModalOpen}
        onClose={handleCloseCompletionModal}
        onConfirm={handleConfirmEnrollment}
      />
    </div>
  )
}
