import { Icon } from '@church/ui/atoms/Icon'
import { paginator } from '../Paginator.styles'
import { LabeledControl } from './LabeledControl'

type PageSizeSelectProps = {
  onChange: (pageSize: number) => void
  options: ReadonlyArray<number>
  value: number
}

export const PageSizeSelect = ({
  onChange,
  options,
  value
}: PageSizeSelectProps) => {
  const slots = paginator()

  return (
    <LabeledControl label="Linhas:">
      {id => (
        <div className={slots.selectBox()}>
          <select
            className={slots.select()}
            id={id}
            onChange={event => onChange(Number(event.target.value))}
            value={String(value)}
          >
            {options.map(option => (
              <option key={option} value={String(option)}>
                {option}
              </option>
            ))}
          </select>
          <Icon className={slots.selectIcon()} name="expand_more" />
        </div>
      )}
    </LabeledControl>
  )
}
