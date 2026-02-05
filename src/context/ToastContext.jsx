import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, icon = '🎵') => {
        setToast({ message, icon, id: Date.now() });
        setTimeout(() => setToast(null), 2000);
    }, []);

    const value = {
        toast,
        showToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toast toast={toast} />
        </ToastContext.Provider>
    );
};
