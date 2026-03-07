import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createClient()

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("student_number", "STU2024001")
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: studentError?.message ?? "Student not found" },
        { status: 500 }
      )
    }

    const { error: deleteError } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", student.id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
