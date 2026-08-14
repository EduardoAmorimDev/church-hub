import { Meta, StoryFn } from '@storybook/nextjs'
import { Button } from '~/components/atoms/Button'
import { Toast, toast, ToastContainer, ToastProps } from './Toast'
import { TypeOptions } from 'react-toastify'

const typeOptions: TypeOptions[] = [
  'info',
  'success',
  'warning',
  'error',
  'default'
]

const meta: Meta<ToastProps> = {
  title: 'molecules/Toast',
  component: Toast,
  decorators: [
    Story => (
      <div className="flex h-100 w-100 flex-col justify-end overflow-hidden">
        <ToastContainer />
        {Story()}
      </div>
    )
  ],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/7I9GnO3cTPpaJPOUfFsI9t/Lamb-Design-System?node-id=13596-1430'
    },
    docs: { description: { component: 'The Lamb Toast component' } }
  },
  args: {
    variant: 'info',
    title: 'Add your alert title here!',
    description:
      'Lorem ipsum dolor sit amet consectetur. Est sed nam nibh eu tortor velit vestibulum lorem. Aliquet vitae elementum.',
    action: <Button size="small">Desfazer</Button>
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'The content of the button',
      options: typeOptions,
      table: {
        type: { summary: typeOptions.join(',') }
      }
    },
    title: {
      control: 'text',
      description: 'The title of toast',
      table: {
        type: { summary: 'string' }
      }
    },
    description: {
      control: 'text',
      description: 'The description of toast',
      table: {
        type: { summary: 'string' }
      }
    },
    action: {
      description: 'The action of toast'
    }
  }
}

export default meta

export const Default: StoryFn<ToastProps> = args => {
  const { variant } = args
  return (
    <Button
      size="small"
      onClick={() => {
        switch (variant) {
          case 'error':
            toast.error(args)
            break
          case 'info':
            toast.info(args)
            break
          case 'success':
            toast.success(args)
            break
          default:
            toast.warning(args)
        }
      }}
    >
      Add Toast
    </Button>
  )
}
