/**
 * Composant Toggle Switch réutilisable
 * Maths-app.com - v1.0 - 2 mars 2026
 */

'use client';

import { forwardRef } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const ToggleSwitch = forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onChange, disabled = false, className = '' }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-14 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          backgroundColor: checked ? '#10b981' : '#6b7280',
          boxShadow: checked ? '0 0 0 1px rgba(16, 185, 129, 0.2)' : '0 0 0 1px rgba(107, 114, 128, 0.2)',
          willChange: 'background-color, box-shadow'
        }}
      >
        <span
          className="inline-block h-3 w-4 transform rounded-full bg-white transition-all duration-300 ease-out shadow-sm"
          style={{
            transform: checked ? 'translateX(2rem)' : 'translateX(0.125rem)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            willChange: 'transform'
          }}
        />
      </button>
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;
