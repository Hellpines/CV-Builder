import { create } from 'zustand';
import { i18n } from '@/shared/i18n/i18n';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

interface ToastState {
  toasts: ToastData[];
  add: (toast: Omit<ToastData, 'id'>) => string;
  remove: (id: string) => void;
}

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;
const defaultTitle = (type: ToastType) => {
  switch (type) {
    case 'success':
      return i18n.t('toast.success');
    case 'error':
      return i18n.t('toast.error');
    case 'warning':
      return i18n.t('toast.warning');
    case 'info':
      return i18n.t('toast.info');
  }
};

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = `toast-${Date.now()}-${counter++}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }].slice(-MAX_TOASTS) }));
    return id;
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

interface ToastOptions {
  title?: string;
  duration?: number;
}

function show(type: ToastType, description: string, options: ToastOptions = {}) {
  return useToastStore.getState().add({
    type,
    title: options.title ?? defaultTitle(type),
    description,
    duration: options.duration ?? DEFAULT_DURATION,
  });
}

export const toast = {
  success: (description: string, options?: ToastOptions) => show('success', description, options),
  error: (description: string, options?: ToastOptions) => show('error', description, options),
  warning: (description: string, options?: ToastOptions) => show('warning', description, options),
  info: (description: string, options?: ToastOptions) => show('info', description, options),
  dismiss: (id: string) => useToastStore.getState().remove(id),
};
