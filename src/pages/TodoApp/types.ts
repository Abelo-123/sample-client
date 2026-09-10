export interface Todo {
  id: number;
  tg_id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export type FilterType = 'all' | 'active' | 'done';
