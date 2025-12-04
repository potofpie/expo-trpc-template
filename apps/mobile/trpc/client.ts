import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@expo-template/api/src/trpc";

export const trpc = createTRPCReact<AppRouter>();

