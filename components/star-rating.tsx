import { Star } from "lucide-react";

export default function StarRating({ value, onChange, disabled = false }: { value: number, onChange: (v: number) => void, disabled?: boolean }) {
  return (
    <div className="flex items-center space-x-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          aria-label={`Rate ${star}`}
          style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0 }}
        >
          <Star className={`h-5 w-5 ${value >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
} 