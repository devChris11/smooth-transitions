"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CourseCard } from "@/components/sisu/CourseCard"
import { CourseDetailModal } from "@/components/sisu/CourseDetailModal"
import { CompletionMethodModal } from "@/components/sisu/CompletionMethodModal"
import { allCourses } from "@/lib/sisu/data"
import type { CourseWithState, Course } from "@/lib/sisu/types"
import type { EnrollmentState } from "@/components/sisu/EnrollmentStateBadge"

// Initialize courses with enrollment state
function initializeCourses(courses: Course[]): CourseWithState[] {
  return courses.map((course) => ({
    ...course,
    enrollmentState: "not_enrolled" as EnrollmentState,
  }))
}

const categories = [
  "All",
  "Marketing",
  "Finance",
  "Management",
  "Business Fundamentals",
  "Analytics",
  "Economics",
  "Law",
]

const courseTypes = [
  { value: "all", label: "All Courses" },
  { value: "compulsory", label: "Compulsory" },
  { value: "optional", label: "Optional" },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("all")
  const [courseStates, setCourseStates] = useState<CourseWithState[]>(() =>
    initializeCourses(allCourses)
  )

  const [selectedCourse, setSelectedCourse] = useState<CourseWithState | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  const filteredCourses = useMemo(() => {
    return courseStates.filter((course) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower)

      // Category filter
      const matchesCategory =
        categoryFilter === "All" || course.category === categoryFilter

      // Type filter
      const matchesType =
        typeFilter === "all" || course.courseType === typeFilter

      return matchesSearch && matchesCategory && matchesType
    })
  }, [courseStates, searchQuery, categoryFilter, typeFilter])

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

    setCourseStates((prev) =>
      prev.map((c) =>
        c.id === selectedCourse.id
          ? { ...c, enrollmentState: "enrolled" as EnrollmentState }
          : c
      )
    )

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
      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-3xl font-bold text-card-foreground md:text-4xl">
          Search for Courses
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover and enroll in optional courses for your degree
        </p>

        {/* Search & Filters */}
        <div className="mt-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by course name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 bg-card pl-10 text-base"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {courseTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
              <p className="text-muted-foreground">
                No courses found matching your search.
              </p>
            </div>
          )}
        </div>
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
