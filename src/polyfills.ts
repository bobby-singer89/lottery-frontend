import { Buffer } from 'buffer';

// Добавляем Buffer в глобальную область
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
  (window as any).process = {
    env: { DEBUG: undefined },
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
}

export {};