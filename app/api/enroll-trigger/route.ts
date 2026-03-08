import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId, enrolledAt } = body;

    if (!studentId || !courseId || !enrolledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await inngest.send({
      name: "enrollment/created",
      data: { studentId, courseId, enrolledAt },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enroll trigger error:", err);
    return NextResponse.json(
      { error: "Failed to send event" },
      { status: 500 }
    );
  }
}
