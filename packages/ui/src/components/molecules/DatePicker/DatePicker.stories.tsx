import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { DatePicker } from './DatePicker'
import type {
  DatePickerProps,
  DatePickerRangeProps,
  DatePickerSingleProps,
  DateRange,
  ISODate
} from './DatePicker.types'

const SingleDemo = (args: DatePickerSingleProps) => {
  const [value, setValue] = useState<ISODate | null>(args.value ?? null)
  return <DatePicker {...args} onChange={setValue} value={value} />
}

const RangeDemo = (args: DatePickerRangeProps) => {
  const [value, setValue] = useState<DateRange | null>(args.value ?? null)
  return <DatePicker {...args} onChange={setValue} value={value} />
}

export default {
  title: 'molecules/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'The Lamb DS `DatePicker`: a pt-BR month calendar (Sunday first) for one date or a range. Values are local `YYYY-MM-DD` strings (`ISODate`). Days are 40px in Painel and 44px in App. Created in Lamb, no Figma node.'
      }
    }
  },
  argTypes: {
    min: { control: 'text' },
    max: { control: 'text' },
    initialMonth: { control: 'text' }
  }
} as Meta<DatePickerProps>

export const Single: StoryObj<DatePickerSingleProps> = {
  args: { shortcuts: ['today', 'yesterday'] },
  render: args => <SingleDemo {...args} />
}

export const Range: StoryObj<DatePickerRangeProps> = {
  args: { mode: 'range' },
  render: args => <RangeDemo {...args} />
}

export const BlockedDays: StoryObj<DatePickerSingleProps> = {
  args: {
    disabledDates: iso =>
      new Date(`${iso}T12:00`).getDay() === 0 ? 'Domingo é dia de culto' : false
  },
  render: args => <SingleDemo {...args} />
}

export const App: StoryObj<DatePickerSingleProps> = {
  decorators: [
    Story => (
      <div data-viewport="mobile">
        <Story />
      </div>
    )
  ],
  render: args => <SingleDemo {...args} />
}
