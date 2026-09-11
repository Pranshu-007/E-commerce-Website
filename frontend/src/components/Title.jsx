const Title = ({ text1, text2, subtitle, align = 'center', className = '' }) => {
  const alignClass = {
    center: 'text-center items-center',
    left: 'text-left items-start',
  }[align] || 'text-center items-center'

  return (
    <div className={`flex flex-col gap-3 mb-8 ${alignClass} ${className}`}>
      <div className={`inline-flex flex-col gap-2 ${align === 'center' ? 'items-center' : 'items-start'}`}>
        <span className="eyebrow">{text1}</span>
        <h2 className="font-display text-3xl sm:text-4xl text-brand-900 tracking-tight">
          {text2}
        </h2>
        <span className={`h-px w-12 bg-brand-900 ${align === 'center' ? 'mx-auto' : ''}`} />
      </div>
      {subtitle && (
        <p className="max-w-xl text-sm sm:text-base text-brand-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default Title
