import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, CloseIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation on mount
        setIsVisible(true);

        const timer = setTimeout(() => {
            handleClose();
        }, 5000); // Auto-dismiss after 5 seconds

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Allow time for fade-out animation before calling the parent onClose
        setTimeout(() => {
            onClose();
        }, 300); // This duration should match the transition duration in className
    };

    const bgColor = type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90';
    const icon = type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : null;

    return (
        <div
            className={`fixed top-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg text-white shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${bgColor} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
        >
            {icon}
            <p className="font-semibold">{message}</p>
            <button onClick={handleClose} className="ml-auto text-white/70 hover:text-white">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Toast;
