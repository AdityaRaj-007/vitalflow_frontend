export default function Card({ children, className = '', variant = 'glass', onClick }) {
  const base = variant === 'light' ? 'card-glass-light' : 'card-glass'
  return (
    <div
      className={`${base} p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
