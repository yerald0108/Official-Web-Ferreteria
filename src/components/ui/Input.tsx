import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          className={clsx(
            'rounded-lg border px-3 py-2 text-sm outline-none transition',
            'focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'