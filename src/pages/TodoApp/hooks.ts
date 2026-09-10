import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api';
import type { Todo } from './types';

const QUERY_KEY = (tgId: string) => ['todos', tgId];

export function useTodos(tgId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY(tgId),
    queryFn: () => fetchTodos(tgId),
    enabled: !!tgId,
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => createTodo(tgId, title),
    onMutate: async (title) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY(tgId) });
      const prev = qc.getQueryData<Todo[]>(QUERY_KEY(tgId)) ?? [];
      const optimistic: Todo = {
        id: -Date.now(),
        tg_id: tgId,
        title,
        is_done: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      qc.setQueryData<Todo[]>(QUERY_KEY(tgId), [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(QUERY_KEY(tgId), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY(tgId) }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_done }: { id: number; is_done: boolean }) =>
      updateTodo(id, { is_done }),
    onMutate: async ({ id, is_done }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY(tgId) });
      const prev = qc.getQueryData<Todo[]>(QUERY_KEY(tgId)) ?? [];
      qc.setQueryData<Todo[]>(
        QUERY_KEY(tgId),
        prev.map(t => t.id === id ? { ...t, is_done } : t)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(QUERY_KEY(tgId), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY(tgId) }),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      updateTodo(id, { title }),
    onMutate: async ({ id, title }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY(tgId) });
      const prev = qc.getQueryData<Todo[]>(QUERY_KEY(tgId)) ?? [];
      qc.setQueryData<Todo[]>(
        QUERY_KEY(tgId),
        prev.map(t => t.id === id ? { ...t, title } : t)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(QUERY_KEY(tgId), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY(tgId) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY(tgId) });
      const prev = qc.getQueryData<Todo[]>(QUERY_KEY(tgId)) ?? [];
      qc.setQueryData<Todo[]>(QUERY_KEY(tgId), prev.filter(t => t.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Todo[]>(QUERY_KEY(tgId), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY(tgId) }),
  });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addTodo: addMutation.mutate,
    toggleTodo: toggleMutation.mutate,
    editTodo: editMutation.mutate,
    deleteTodo: deleteMutation.mutate,
  };
}
