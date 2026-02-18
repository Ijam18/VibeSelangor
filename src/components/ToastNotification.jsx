import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

/**
 * Toast Notification System
 * Replaces all alert() calls throughout the app.
 * 
 * Usage:
 *   import { useToast } from './components/ToastNotification';
 *   const { showToast } = useToast();
 *   showToast('Profile updated!', 'success');
 *   showToast('Something went wrong', 'error');
 *   showToast('Class is now LIVE', 'info');
 */

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = React.createContext(null);

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;
    return (
        <div style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxWidth: '360px',
            width: 'calc(100vw - 2rem)',
            pointerEvents: 'none'
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// ─── Individual Toast ─────────────────────────────────────────────────────────
const TOAST_STYLES = {
    success: {
        bg: '#1a1a1a',
        border: '#22c55e',
        icon: <Check size={16} />,
        iconColor: '#22c55e',
        label: 'Success'
    },
    error: {
        bg: '#1a1a1a',
        border: '#ef4444',
        icon: <X size={16} />,
        iconColor: '#ef4444',
        label: 'Error'
    },
    info: {
        bg: '#1a1a1a',
        border: '#3b82f6',
        icon: <Info size={16} />,
        iconColor: '#3b82f6',
        label: 'Info'
    },
    warning: {
        bg: '#1a1a1a',
        border: '#f59e0b',
        icon: <AlertCircle size={16} />,
        iconColor: '#f59e0b',
        label: 'Warning'
    }
};

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

    useEffect(() => {
        // Slide in
        const showTimer = setTimeout(() => setVisible(true), 10);
        // Start leaving animation
        const leaveTimer = setTimeout(() => setLeaving(true), toast.duration - 400);
        // Remove from DOM
        const removeTimer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(leaveTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.duration, onRemove]);

    const handleClose = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 350);
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                background: style.bg,
                border: `2px solid ${style.border}`,
                borderRadius: '12px',
                boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)`,
                pointerEvents: 'all',
                cursor: 'default',
                transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
                opacity: visible && !leaving ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
                willChange: 'transform, opacity',
            }}
        >
            {/* Icon */}
            <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `${style.border}22`,
                border: `1.5px solid ${style.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: style.iconColor,
                flexShrink: 0,
                marginTop: '1px'
            }}>
                {style.icon}
            </div>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: style.iconColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px'
                }}>
                    {style.label}
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#e5e7eb',
                    lineHeight: 1.4,
                    fontFamily: 'Inter, sans-serif'
                }}>
                    {toast.message}
                </div>
            </div>

            {/* Close button */}
            <button
                onClick={handleClose}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    flexShrink: 0,
                    transition: 'color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
                <X size={14} />
            </button>
        </div>
    );
}

export default ToastProvider;
