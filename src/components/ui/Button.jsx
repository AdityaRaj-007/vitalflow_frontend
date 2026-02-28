import Icon from './Icon'

export default function Button({
  children,
  variant = 'primary',
  icon,
  iconRight,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant} ${className}`}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
      {iconRight && <Icon name={iconRight} size={15} />}
    </button>
  )
}
