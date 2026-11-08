"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hide } from "@/lib/server/targets";
import { targetSchema } from "@/lib/validation/public";

export async function moderate(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

  const { targetType, targetId } = targetSchema.parse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
  });
  const action = formData.get("action");

  if (action === "hide") await hide(targetType, targetId, true);
  if (action === "restore") {
    await hide(targetType, targetId, false);
    // A restored item starts with a clean slate, otherwise the next report re-hides it.
    const data = { reports: 0 };
    if (targetType === "public_entry") {
      await db.publicEntry.update({ where: { id: targetId }, data });
    } else {
      await db.sharedNote.update({ where: { id: targetId }, data });
    }
  }

  // Every decision closes the open reports for that item.
  await db.report.updateMany({
    where: { targetType, targetId, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });
  revalidatePath("/admin");
}
