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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{
          backgroundColor: checked ? 'rgb(34 197 94)' : 'rgb(107 114 128)'
        }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
          style={{
            transform: checked ? 'translateX(1.25rem)' : 'translateX(0.125rem)'
          }}
        />
      </button>
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;
