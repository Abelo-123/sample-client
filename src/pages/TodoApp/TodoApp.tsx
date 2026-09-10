import { useState, useMemo } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useTodos } from './hooks';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import type { Todo } from './types';
import './TodoApp.css';

export function TodoApp() {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const tgId = useMemo(() => {
    try {
      const lp = retrieveLaunchParams();
      if (lp?.tgWebAppInitData) {
        const raw = typeof lp.tgWebAppInitData === 'string'
          ? lp.tgWebAppInitData
          : String((lp as Record<string, unknown>).tgWebAppInitDataRaw || '');
        const userRaw = new URLSearchParams(raw).get('user');
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u?.id) return String(u.id);
        }
      }
    } catch { /* ignore */ }
    return 'demo_user';
  }, []);

  const { todos, isLoading, isError, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos(tgId);

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.is_done);
    if (filter === 'completed') return todos.filter(t => t.is_done);
    return todos;
  }, [todos, filter]);

  const activeCount = useMemo(() => todos.filter(t => !t.is_done).length, [todos]);
  const completedCount = useMemo(() => todos.filter(t => t.is_done).length, [todos]);

  const handleAddSubmit = (title: string) => {
    addTodo(title);
  };

  const handleEditSubmit = (title: string) => {
    if (editingTodo) {
      editTodo({ id: editingTodo.id, title });
    }
  };

  return (
    <div className="todo-app">
      <header className="todo-app__header">
        <div className="todo-app__header-content">
          <h1 className="todo-app__title">⚡ Tasks</h1>
          <p className="todo-app__subtitle">
            {activeCount === 0 ? 'All caught up! 🎉' : `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`}
          </p>
        </div>

        <div className="todo-app__filters">
          <button
            className={`todo-app__filter ${filter === 'all' ? 'todo-app__filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            className={`todo-app__filter ${filter === 'active' ? 'todo-app__filter--active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`todo-app__filter ${filter === 'completed' ? 'todo-app__filter--active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Done ({completedCount})
          </button>
        </div>
      </header>

      <main className="todo-app__body">
        {isLoading ? (
          <div className="todo-app__skeleton-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="todo-app__skeleton-item" />
            ))}
          </div>
        ) : isError ? (
          <div className="todo-app__empty">
            <p className="todo-app__empty-icon">⚠️</p>
            <p className="todo-app__empty-text">Failed to load tasks. Check server status.</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="todo-app__empty">
            <p className="todo-app__empty-icon">{filter === 'completed' ? '🎯' : '📝'}</p>
            <p className="todo-app__empty-text">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : filter === 'active'
                ? 'No active tasks!'
                : 'No tasks yet. Tap + to add one!'}
            </p>
          </div>
        ) : (
          <ul className="todo-app__list">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo({ id: todo.id, is_done: !todo.is_done })}
                onDelete={() => deleteTodo(todo.id)}
                onEdit={() => {
                  setEditingTodo(todo);
                  setFormMode('edit');
                }}
              />
            ))}
          </ul>
        )}
      </main>

      <button
        id="todo-add-btn"
        className="todo-app__fab"
        onClick={() => setFormMode('add')}
        aria-label="Add Task"
      >
        +
      </button>

      {formMode === 'add' && (
        <TodoForm
          mode="add"
          onSubmit={handleAddSubmit}
          onClose={() => setFormMode(null)}
        />
      )}

      {formMode === 'edit' && editingTodo && (
        <TodoForm
          mode="edit"
          initialValue={editingTodo.title}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setFormMode(null);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}
