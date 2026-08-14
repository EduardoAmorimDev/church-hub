import { ReactNode, useId } from 'react'
import { Typography } from '@church/ui/atoms/Typography'
import { paginator } from '../Paginator.styles'

type LabeledControlProps = {
  children: (id: string) => ReactNode
  label: string
}

export const LabeledControl = ({ children, label }: LabeledControlProps) => {
  const id = useId()
  const slots = paginator()

  return (
    <div className={slots.cluster()}>
      <Typography
        as="label"
        className={slots.supportingText()}
        htmlFor={id}
        variant="p3"
      >
        {label}
      </Typography>
      {children(id)}
    </div>
  )
}
