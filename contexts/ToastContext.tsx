import React, {createContext, useContext, ReactNode} from "react";
import {useToast} from "../hooks/useToast";
import Toast from "../components/Toast";

type ToastType = "success" | "warning" | "error";

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {toast, showToast, hideToast} = useToast();

  return (
    <ToastContext.Provider value={{showToast, hideToast}}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
