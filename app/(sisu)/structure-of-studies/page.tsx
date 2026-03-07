"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/sisu/CourseCard"
import { CourseDetailModal } from "@/components/sisu/CourseDetailModal"
import { CompletionMethodModal } from "@/components/sisu/CompletionMethodModal"
import { compulsoryCourses, optionalCourses } from "@/lib/sisu/data"
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
  const [compulsoryCourseStates, setCompulsoryCourseStates] = useState<CourseWithState[]>(
    () => initializeCourses(compulsoryCourses)
  )
  const [optionalCourseStates, setOptionalCourseStates] = useState<CourseWithState[]>(
    () => initializeCourses(optionalCourses)
  )

  const [selectedCourse, setSelectedCourse] = useState<CourseWithState | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  const handleCourseClick = (course: CourseWithState) => {
    setSelectedCourse(course)
    setIsDetailModalOpen(true)
  }

  const handleEnrollClick = () => {
    setIsDetailModalOpen(false)
    setIsCompletionModalOpen(true)
  }

  const handleConfirmEnrollment = () => {
    if (!selectedCourse) return

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

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCourse(null)
  }

  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Degree Header */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h1 className="text-3xl font-bold text-card-foreground md:text-4xl">
          {"Bachelor's Degree Programme in Business Administration"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suomi University of Applied Sciences
        </p>
        <p className="mt-1 text-sm text-muted-foreground">180 credits required</p>

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
