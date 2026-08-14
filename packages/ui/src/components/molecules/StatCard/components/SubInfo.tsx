import { Icon, IconName } from '@church/ui/atoms/Icon'

// invariant: numbers render in pt-BR (Lamb `formatNumber`); a string, such
// as "—" for a missing value, is shown as given.
export const formatValue = (
  value: number | string,
  format?: Intl.NumberFormatOptions
) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('pt-BR', format).format(value)
    : value

export type SubInfoProps = {
  value: number | string
  label: string
  iconName?: IconName
}

export const SubInfo = ({ iconName, label, value }: SubInfoProps) => (
  <span className="text-size-25 inline-flex items-center gap-1">
    {iconName && (
      <Icon className="text-icon-14! text-secondary" name={iconName} />
    )}
    <strong className="text-primary font-medium">{formatValue(value)}</strong>
    <span className="text-secondary font-normal">{label}</span>
  </span>
)
