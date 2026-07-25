/**
 * Button — design-system button component.
 *
 * Props:
 *   variant  : 'primary' | 'secondary' | 'ghost' | 'accent-outline' | 'danger'
 *   size     : 'sm' | 'md' | 'lg'
 *   as       : 'button' | 'a'  (default 'button')
 *   loading  : boolean
 *   disabled : boolean
 *   icon     : ReactNode (prepended before children)
 *   iconRight: ReactNode (appended after children)
 *   full     : boolean (width: 100%)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  full = false,
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  return (
    <Tag
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        full ? 'btn--full' : '',
        loading ? 'btn--loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: full ? '100%' : undefined, ...style }}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      ) : (
        icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{iconRight}</span>
      )}
    </Tag>
  );
}
