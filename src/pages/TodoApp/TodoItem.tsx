import { useState, useRef } from 'react';
import type { Todo } from './types';
import { hapticImpact, hapticNotification, showConfirm } from '@/helpers/telegram';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleToggle = () => {
    hapticImpact('light');
    if (!todo.is_done) {
      hapticNotification('success');
    }
    onToggle();
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm('Delete this task?', 'Delete Task');
    if (confirmed) {
      hapticImpact('medium');
      setIsDeleting(true);
      // Delay for animation
      setTimeout(() => onDelete(), 250);
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      hapticImpact('rigid');
      onEdit();
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <li
      className={`todo-item ${todo.is_done ? 'todo-item--done' : ''} ${isDeleting ? 'todo-item--deleting' : ''}`}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
    >
      {/* Checkbox */}
      <button
        id={`todo-toggle-${todo.id}`}
        className={`todo-item__checkbox ${todo.is_done ? 'todo-item__checkbox--checked' : ''}`}
        onClick={handleToggle}
        aria-label={todo.is_done ? 'Mark as incomplete' : 'Mark as complete'}
        type="button"
      >
        {todo.is_done && <span className="todo-item__checkmark">✓</span>}
      </button>

      {/* Content */}
      <div className="todo-item__content" onClick={onEdit}>
        <span className="todo-item__title">{todo.title}</span>
        <span className="todo-item__date">{formatDate(todo.created_at)}</span>
      </div>

      {/* Delete */}
      <button
        id={`todo-delete-${todo.id}`}
        className="todo-item__delete"
        onClick={handleDelete}
        aria-label="Delete task"
        type="button"
      >
        🗑
      </button>
    </li>
  );
}
