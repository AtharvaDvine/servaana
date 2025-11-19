import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 4000,
      ...toast
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto remove toast after duration
    setTimeout(() => {
      get().removeToast(id);
    }, newToast.duration);
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },
  
  // Helper methods
  success: (message, title = 'Success') => {
    return get().addToast({ type: 'success', title, message });
  },
  
  error: (message, title = 'Error') => {
    return get().addToast({ type: 'error', title, message, duration: 6000 });
  },
  
  warning: (message, title = 'Warning') => {
    return get().addToast({ type: 'warning', title, message });
  },
  
  info: (message, title = 'Info') => {
    return get().addToast({ type: 'info', title, message });
  }
}));

export default useToastStore;