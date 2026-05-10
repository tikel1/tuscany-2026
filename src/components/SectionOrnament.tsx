interface Props {
  label?: string;
  className?: string;
}

export default function SectionOrnament({ label, className }: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-cream-400/80 ${className ?? ""}`}
      aria-hidden
    >
      <div className="h-px w-16 sm:w-28 bg-current opacity-50" />
      <svg width="42" height="14" viewBox="0 0 42 14" className="text-terracotta-500/70">
        <circle cx="6" cy="7" r="2" fill="currentColor" />
        <path
          d="M14 7 Q21 1 28 7 Q21 13 14 7 Z"
          fill="currentColor"
          opacity="0.85"
        />
        <circle cx="36" cy="7" r="2" fill="currentColor" />
      </svg>
      <div className="h-px w-16 sm:w-28 bg-current opacity-50" />
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
