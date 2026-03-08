"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type StudentContextRow = {
  id: string;
  context_brief: string;
  generated_at: string;
  student_id: string;
  course_id: string;
  courses: { name: string; course_code: string } | null;
  students: { name: string } | null;
};

export default function DeosPage() {
  const [contexts, setContexts] = useState<StudentContextRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContexts = async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("student_contexts")
      .select(
        "id, context_brief, generated_at, course_id, student_id, courses(name, course_code), students(name)"
      )
      .order("generated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setContexts([]);
    } else {
      setError(null);
      const rows = (data ?? []) as Array<{
        id: string;
        context_brief: string;
        generated_at: string;
        student_id: string;
        course_id: string;
        courses: { name: string; course_code: string } | { name: string; course_code: string }[] | null;
        students: { name: string } | { name: string }[] | null;
      }>;
      setContexts(
        rows.map((r) => ({
          ...r,
          courses: Array.isArray(r.courses) ? r.courses[0] ?? null : r.courses,
          students: Array.isArray(r.students) ? r.students[0] ?? null : r.students,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContexts();

    const supabase = createClient();
    const channel = supabase
      .channel("student_contexts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_contexts" },
        () => {
          fetchContexts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Loading contexts...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-destructive">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">DegreeOS — Agent Output</h1>
      <p className="mb-8 text-muted-foreground">
        Raw agent context briefs for testing
      </p>

      {contexts.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No agent contexts yet. Enroll in a course on SISU to trigger the agent.
        </p>
      ) : (
        <ul className="space-y-4">
          {contexts.map((ctx) => (
            <li
              key={ctx.id}
              className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <h2 className="text-lg font-semibold">
                {ctx.courses?.name ?? "Unknown course"} (
                {ctx.courses?.course_code ?? "—"})
              </h2>
              <p className="mb-2 text-sm text-muted-foreground">
                {ctx.students?.name ?? "Unknown student"}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                {new Date(ctx.generated_at).toLocaleString()}
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {ctx.context_brief}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
