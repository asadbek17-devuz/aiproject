"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { recordLessonCompletion } from "@/server/learning/progress";

export async function completeLessonAction(lessonId: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const ok = await recordLessonCompletion(user.id, lessonId);

  if (ok) {
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/reputation");
  }

  return { ok };
}
