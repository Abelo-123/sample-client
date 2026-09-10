import { useState, useEffect, useRef } from 'react';
import { hapticImpact } from '@/helpers/telegram';

interface TodoFormProps {
  mode: 'add' | 'edit';
  initialValue?: string;
  onSubmit: (title: string) => void;
  onClose: () => void;
}

export function TodoForm({ mode, initialValue = '', onSubmit, onClose }: TodoFormProps) {
  const [value, setValue] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger slide-up animation
    requestAnimationFrame(() => setIsVisible(true));
    // Focus input after animation starts
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    hapticImpact('light');
    onSubmit(trimmed);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  return (
    <div
      className={`todo-modal-overlay ${isVisible ? 'todo-modal-overlay--visible' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`todo-modal ${isVisible ? 'todo-modal--visible' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="todo-modal__handle" />
        <h2 className="todo-modal__title">
          {mode === 'add' ? '✏️ New Task' : '📝 Edit Task'}
        </h2>

        <form onSubmit={handleSubmit} className="todo-modal__form">
          <div className="todo-modal__input-wrapper">
            <input
              id="todo-title-input"
              ref={inputRef}
              type="text"
              className="todo-modal__input"
              placeholder="What needs to be done?"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              autoComplete="off"
            />
            {value && (
              <button
                type="button"
                className="todo-modal__clear"
                onClick={() => setValue('')}
                aria-label="Clear input"
              >
                ×
              </button>
            )}
          </div>
          <p className="todo-modal__char-count">{value.length}/500</p>

          <div className="todo-modal__actions">
            <button
              id="todo-form-cancel"
              type="button"
              className="todo-modal__btn todo-modal__btn--cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              id="todo-form-submit"
              type="submit"
              className="todo-modal__btn todo-modal__btn--submit"
              disabled={!value.trim()}
            >
              {mode === 'add' ? 'Add Task' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
