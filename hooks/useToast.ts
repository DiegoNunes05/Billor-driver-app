// hooks/useToast.ts
import { useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'success' | 'warning' | 'error' | null;

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: null
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({
      visible: true,
      message,
      type
    });
 
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  }, []);
  
  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(prev => ({ ...prev, visible: false }));
  }, []);
  
  return {
    toast,
    showToast,
    hideToast
  };
};