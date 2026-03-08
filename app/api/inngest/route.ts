import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processEnrollment } from "@/lib/inngest/functions";

const handler = serve({
  client: inngest,
  functions: [processEnrollment],
});

export const { GET, POST, PUT } = handler;
