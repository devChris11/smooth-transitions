import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";

type EnrollmentEventData = {
  studentId: string;
  courseId: string;
  enrolledAt: string;
};

type FetchContextResult = {
  student: { id: string; name: string; student_number: string };
  course: {
    id: string;
    name: string;
    course_code: string;
    credits: number | null;
    category: string | null;
    completion_method: string | null;
    description: string | null;
  };
  items: Array<{
    id: string;
    title: string;
    item_type: string;
    day_offset: number;
    description: string | null;
  }>;
};

export const processEnrollment = inngest.createFunction(
  {
    id: "process-enrollment",
    name: "Process Course Enrollment",
  },
  { event: "enrollment/created" },
  async ({ event, step }) => {
    try {
      const context = await step.run("fetch-context", async (): Promise<FetchContextResult> => {
        const supabase = createServiceClient();

        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("id, name, student_number")
          .eq("id", (event.data as EnrollmentEventData).studentId)
          .single();

        if (studentError || !studentData) {
          throw new Error(`Failed to fetch student: ${studentError?.message ?? "Not found"}`);
        }

        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, name, course_code, credits, category, completion_method, description")
          .eq("id", (event.data as EnrollmentEventData).courseId)
          .single();

        if (courseError || !courseData) {
          throw new Error(`Failed to fetch course: ${courseError?.message ?? "Not found"}`);
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from("course_items")
          .select("id, title, item_type, day_offset, description")
          .eq("course_id", (event.data as EnrollmentEventData).courseId)
          .order("day_offset", { ascending: true });

        if (itemsError) {
          throw new Error(`Failed to fetch course items: ${itemsError.message}`);
        }

        return {
          student: {
            id: studentData.id,
            name: studentData.name,
            student_number: studentData.student_number,
          },
          course: {
            id: courseData.id,
            name: courseData.name,
            course_code: courseData.course_code,
            credits: courseData.credits,
            category: courseData.category,
            completion_method: courseData.completion_method,
            description: courseData.description,
          },
          items: (itemsData ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            item_type: item.item_type,
            day_offset: item.day_offset,
            description: item.description,
          })),
        };
      });

      const brief = await step.run("generate-context", async (): Promise<string> => {
        const itemsText = context.items
          .map((i) => `- [${i.item_type}] ${i.title} (Day ${i.day_offset})`)
          .join("\n");

        const prompt = `You are an academic context assistant for DegreeOS. A student has just enrolled in a new course. Prepare a concise onboarding brief for them.

Student: ${context.student.name} (${context.student.student_number})
Course: ${context.course.name} (${context.course.course_code})
Credits: ${context.course.credits ?? "N/A"}
Category: ${context.course.category ?? "N/A"}
Completion method: ${context.course.completion_method ?? "N/A"}
Description: ${context.course.description ?? "N/A"}

Course items:
${itemsText}

Write a 2-3 sentence onboarding brief that tells the student:
1. What this course is fundamentally about
2. What their first concrete action should be
3. The most important deadline to be aware of

Be direct and specific. No filler. Write in second person addressing the student directly.`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Anthropic API error: ${response.status} ${response.statusText} — ${errorBody}`);
        }

        const data = (await response.json()) as {
          content?: Array<{ type: string; text?: string }>;
        };

        const textContent = data.content?.[0]?.text;
        if (!textContent) {
          throw new Error("No text content in Anthropic response");
        }

        return textContent;
      });

      await step.run("save-context", async (): Promise<{ success: boolean }> => {
        const supabase = createServiceClient();

        const { error } = await supabase.from("student_contexts").upsert(
          {
            student_id: (event.data as EnrollmentEventData).studentId,
            course_id: (event.data as EnrollmentEventData).courseId,
            context_brief: brief,
            generated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,course_id" }
        );

        if (error) {
          throw new Error(`Failed to save context: ${error.message}`);
        }

        return { success: true };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("processEnrollment error:", message);
      throw err;
    }
  }
);
