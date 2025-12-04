import { router } from "./index";
import { todoRouter } from "./routers/todo";

export const appRouter = router({
  todo: todoRouter,
});

export type AppRouter = typeof appRouter;
