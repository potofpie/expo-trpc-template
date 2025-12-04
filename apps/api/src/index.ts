import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/router";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

app.get("/_health", (c) => {
  return c.json({ message: "👋" });
});

const port = process.env.PORT || 3000;

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running on http://localhost:${port}`);
