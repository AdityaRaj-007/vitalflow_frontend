export default function Header({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-3 mb-6 md:mb-8">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-cream tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate text-xs sm:text-sm mt-1 leading-snug">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}
