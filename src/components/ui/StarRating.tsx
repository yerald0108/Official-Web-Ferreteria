import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number          // 0–5, acepta decimales
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export default function StarRating({
  value,
  max = 5,
  size = 14,
  interactive = false,
  onChange,
  className = '',
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled    = i + 1 <= Math.round(value)
        const halfFill  = !filled && i < value && value - i >= 0.25

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`transition-transform ${interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
            aria-label={`${i + 1} estrella${i !== 0 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={
                filled
                  ? 'text-orange-400'
                  : halfFill
                  ? 'text-orange-300'
                  : 'text-gray-200 dark:text-gray-700'
              }
              fill={filled ? '#fb923c' : halfFill ? '#fdba74' : 'none'}
            />
          </button>
        )
      })}
    </div>
  )
}