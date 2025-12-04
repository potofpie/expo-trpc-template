import { router, publicProcedure } from "../index";
import { db, todos, eq, desc } from "@expo-template/database";
import { z } from "zod";

export const todoRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(todos).orderBy(desc(todos.createdAt));
  }),

  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const [todo] = await db
        .insert(todos)
        .values({ text: input.text })
        .returning();
      return todo;
    }),

  toggle: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const [todo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, input.id));

      if (!todo) {
        throw new Error("Todo not found");
      }

      const [updated] = await db
        .update(todos)
        .set({ completed: !todo.completed })
        .where(eq(todos.id, input.id))
        .returning();

      return updated;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(todos).where(eq(todos.id, input.id));
      return { success: true };
    }),
});
