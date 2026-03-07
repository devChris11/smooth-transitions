"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { EnrollmentStateBadge } from "@/components/sisu/EnrollmentStateBadge"

// Placeholder data - in a real app this would come from state or database
const enrolledCourses = [
  {
    id: "1",
    name: "Introduction to Business",
    code: "BBA1001",
    credits: 5,
  },
  {
    id: "3",
    name: "Marketing Fundamentals",
    code: "BBA1003",
    credits: 5,
  },
]

const pendingCourses = [
  {
    id: "2",
    name: "Financial Accounting",
    code: "BBA1002",
    credits: 8,
  },
]

interface CourseListCardProps {
  course: {
    id: string
    name: string
    code: string
    credits: number
  }
  status: "enrolled" | "pending"
}

function CourseListCard({ course, status }: CourseListCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-card-foreground">{course.name}</h3>
        <p className="text-sm text-muted-foreground">
          {course.code} · {course.credits} credits
        </p>
      </div>
      <div className="flex items-center gap-3">
        <EnrollmentStateBadge state={status} />
        {status === "enrolled" && (
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Go to Moodle
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

export default function SisuHomePage() {
  const hasEnrolled = enrolledCourses.length > 0
  const hasPending = pendingCourses.length > 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Home</h1>
      <p className="mt-2 text-lg text-muted-foreground">Welcome back, Mikael</p>

      <div className="mt-8 space-y-8">
        {/* Active Enrollments */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">Active Enrollments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Courses you are currently enrolled in
          </p>

          <div className="mt-4 space-y-3">
            {hasEnrolled ? (
              enrolledCourses.map((course) => (
                <CourseListCard key={course.id} course={course} status="enrolled" />
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

        {/* Pending Enrollments */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">Pending Enrollments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Courses awaiting confirmation
          </p>

          <div className="mt-4 space-y-3">
            {hasPending ? (
              pendingCourses.map((course) => (
                <CourseListCard key={course.id} course={course} status="pending" />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">No pending enrollments.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
