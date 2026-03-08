import { createClient } from "@/lib/supabase/client"
import type { Course, CourseItem, CompletionMethod, CourseType } from "@/lib/sisu/types"

export async function fetchDegreeProgramme(): Promise<{
  id: string
  name: string
  totalCreditsRequired: number
} | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("degree_programmes")
    .select("id, name, total_credits_required")
    .eq("code", "BBA2024")
    .single()

  if (error) {
    console.error("fetchDegreeProgramme error:", error.message)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    totalCreditsRequired: data.total_credits_required ?? 0,
  }
}

export async function fetchStudent(): Promise<{
  id: string
  name: string
  studentNumber: string
  degreeProgrammeId: string
} | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("students")
    .select("id, name, student_number, degree_programme_id")
    .eq("student_number", "STU2024001")
    .single()

  if (error) {
    console.error("fetchStudent error:", error.message)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    name: data.name,
    studentNumber: data.student_number,
    degreeProgrammeId: data.degree_programme_id,
  }
}

export async function fetchCourses(degreeProgrammeId: string): Promise<Course[]> {
  const supabase = createClient()
  const { data: coursesData, error: coursesError } = await supabase
    .from("courses")
    .select("id, course_code, name, credits, category, type, description, completion_method, learning_outcomes")
    .eq("degree_programme_id", degreeProgrammeId)

  if (coursesError) {
    console.error("fetchCourses error:", coursesError.message)
    return []
  }

  if (!coursesData || coursesData.length === 0) return []

  const courseIds = coursesData.map((c) => c.id)
  const { data: itemsData, error: itemsError } = await supabase
    .from("course_items")
    .select("*")
    .in("course_id", courseIds)
    .order("day_offset", { ascending: true })

  if (itemsError) {
    console.error("fetchCourses (items) error:", itemsError.message)
    return []
  }

  const itemsByCourseId = new Map<string, typeof itemsData>()
  for (const item of itemsData ?? []) {
    const list = itemsByCourseId.get(item.course_id) ?? []
    list.push(item)
    itemsByCourseId.set(item.course_id, list)
  }

  return coursesData.map((row) => {
    const items = (itemsByCourseId.get(row.id) ?? []) as Array<{
      id: string
      item_type: string
      title: string
      description: string | null
      day_offset: number
    }>
    const dayOffsets = items.map((i) => i.day_offset)
    const teachingPeriodStart = dayOffsets.length > 0 ? Math.min(...dayOffsets) : 0
    const teachingPeriodEnd = dayOffsets.length > 0 ? Math.max(...dayOffsets) : 0

    const courseItems: CourseItem[] = [...items]
      .sort((a, b) => a.day_offset - b.day_offset)
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description ?? undefined,
        type: i.item_type as CourseItem["type"],
        dayOffset: i.day_offset,
      }))

    return {
      id: row.id,
      code: row.course_code,
      name: row.name,
      credits: row.credits ?? 0,
      category: row.category ?? "",
      completionMethod: row.completion_method as CompletionMethod,
      description: row.description ?? "",
      learningOutcomes: row.learning_outcomes ?? "",
      teachingPeriodStart,
      teachingPeriodEnd,
      courseType: row.type as CourseType,
      items: courseItems,
    } satisfies Course
  })
}

export async function fetchEnrollments(studentId: string): Promise<
  {
    courseId: string
    enrolledAt: string
    completionMethodSelected: string | null
  }[]
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at, completion_method_selected")
    .eq("student_id", studentId)

  if (error) {
    console.error("fetchEnrollments error:", error.message)
    return []
  }

  if (!data) return []

  return data.map((row) => ({
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    completionMethodSelected: row.completion_method_selected,
  }))
}

export async function enrollInCourse(
  studentId: string,
  courseId: string,
  completionMethod: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .single()

  if (existing) {
    return { success: true }
  }

  const { error } = await supabase.from("enrollments").insert({
    student_id: studentId,
    course_id: courseId,
    completion_method_selected: completionMethod,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  try {
    await fetch("/api/enroll-trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        courseId,
        enrolledAt: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error("Enroll trigger error:", err)
  }

  return { success: true }
}

export async function unenrollFromCourse(
  studentId: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("student_id", studentId)
    .eq("course_id", courseId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
