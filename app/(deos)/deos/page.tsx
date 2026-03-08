"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchContexts = async () => {
    const supabase = createClient();
    const { data: contextData, error: fetchError } = await supabase
      .from("student_contexts")
      .select("id, context_brief, generated_at, course_id, student_id")
      .order("generated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setContexts([]);
    } else {
      setError(null);
      const rows = (contextData ?? []) as Array<{
        id: string;
        context_brief: string;
        generated_at: string;
        student_id: string;
        course_id: string;
      }>;

      if (rows.length === 0) {
        setContexts([]);
      } else {
        const courseIds = [...new Set(rows.map((r) => r.course_id))];
        const studentIds = [...new Set(rows.map((r) => r.student_id))];

        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, name, course_code")
          .in("id", courseIds);

        const { data: studentsData } = await supabase
          .from("students")
          .select("id, name")
          .in("id", studentIds);

        const coursesMap = new Map(
          (coursesData ?? []).map((c) => [c.id, { name: c.name, course_code: c.course_code }])
        );
        const studentsMap = new Map(
          (studentsData ?? []).map((s) => [s.id, { name: s.name }])
        );

        setContexts(
          rows.map((r) => ({
            ...r,
            courses: coursesMap.get(r.course_id) ?? null,
            students: studentsMap.get(r.student_id) ?? null,
          }))
        );
      }
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold">DegreeOS — Agent Output</h1>
          <p className="text-muted-foreground">
            Raw agent context briefs for testing
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setRefreshing(true);
            await fetchContexts();
            setRefreshing(false);
          }}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <Loader2 className="animate-spin" />
              Refresh
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

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
