const FormField = ({
  label,
  hint,
  children,
  className = '',
}) => (
  <div className={`w-full ${className}`}>
    {label && <label className="admin-label">{label}</label>}
    {children}
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
)

export default FormField
