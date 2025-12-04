import { create } from "zustand";
import type { AppRouter } from "@expo-template/api/src/trpc";
import type { TRPCClientError } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

type Todo = RouterOutputs["todo"]["list"][number];
type CreateInput = RouterInputs["todo"]["create"];
type ToggleInput = RouterInputs["todo"]["toggle"];
type DeleteInput = RouterInputs["todo"]["delete"];

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: TRPCClientError<AppRouter> | null;

  setTodos: (todos: Todo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: TRPCClientError<AppRouter> | null) => void;

  create: (
    input: CreateInput,
    mutateAsync: (input: CreateInput) => Promise<Todo>
  ) => Promise<void>;
  toggle: (
    input: ToggleInput,
    mutateAsync: (input: ToggleInput) => Promise<Todo>
  ) => Promise<void>;
  delete: (
    input: DeleteInput,
    mutateAsync: (input: DeleteInput) => Promise<{ success: boolean }>
  ) => Promise<void>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  setTodos: (todos) => set({ todos }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  create: async (input, mutateAsync) => {
    const tempId = Date.now();
    const now = new Date().toISOString();
    const optimisticTodo: Todo = {
      id: tempId,
      text: input.text,
      completed: false,
      createdAt: now,
    };

    set((state) => ({
      todos: [optimisticTodo, ...state.todos],
    }));

    try {
      const todo = await mutateAsync(input);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === tempId ? todo : t)),
      }));
    } catch (error) {
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== tempId),
        error: error as TRPCClientError<AppRouter>,
      }));
      throw error;
    }
  },

  toggle: async (input, mutateAsync) => {
    const todo = get().todos.find((t) => t.id === input.id);
    if (!todo) return;

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === input.id ? { ...t, completed: !t.completed } : t
      ),
    }));

    try {
      const updated = await mutateAsync(input);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === input.id ? updated : t)),
      }));
    } catch (error) {
      set((state) => ({
        todos: state.todos.map((t) =>
          t.id === input.id ? { ...t, completed: todo.completed } : t
        ),
        error: error as TRPCClientError<AppRouter>,
      }));
      throw error;
    }
  },

  delete: async (input, mutateAsync) => {
    const todo = get().todos.find((t) => t.id === input.id);
    if (!todo) return;

    set((state) => ({
      todos: state.todos.filter((t) => t.id !== input.id),
    }));

    try {
      await mutateAsync(input);
    } catch (error) {
      if (todo) {
        set((state) => ({
          todos: [...state.todos, todo].sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          }),
          error: error as TRPCClientError<AppRouter>,
        }));
      }
      throw error;
    }
  },
}));
