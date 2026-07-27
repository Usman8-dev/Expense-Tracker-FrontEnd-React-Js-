import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useRef(null);

  const showToast = (options) => {
    toast.current?.show(options);
  };

  return (
    <ToastContext.Provider value={showToast}>
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}