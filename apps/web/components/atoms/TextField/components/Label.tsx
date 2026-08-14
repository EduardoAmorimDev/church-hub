import { ComponentProps } from 'react'

export type LabelProps = ComponentProps<'label'>

export const Label = (props: LabelProps) => <label {...props} />
