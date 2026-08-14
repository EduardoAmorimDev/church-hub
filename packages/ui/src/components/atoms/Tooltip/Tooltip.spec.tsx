import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from './Tooltip'

const renderTooltip = (props: Partial<Parameters<typeof Tooltip>[0]> = {}) =>
  render(
    <Tooltip content="Editar membro" {...props}>
      <button type="button">Editar</button>
    </Tooltip>
  )

describe('Tooltip', () => {
  it.each([
    ['top', 'mb-2'],
    ['bottom', 'mt-2'],
    ['left', 'mr-2'],
    ['right', 'ml-2']
  ] as const)(
    'appearance: %s placement keeps the Lamb panel 8px from the trigger',
    (placement, distance) => {
      renderTooltip({ placement })
      const panel = screen.getByRole('tooltip')

      expect(panel).toHaveClass(
        distance,
        'bg-neutral-999',
        'text-inverse',
        'px-2',
        'py-1',
        'rounded-lg',
        'whitespace-nowrap',
        'shadow-elevation-high-bottom',
        'transition-[opacity,visibility]',
        'duration-120',
        'ease-out'
      )
      expect(panel.children).toHaveLength(0)
    }
  )

  it.each([
    [undefined, ['font-medium', 'text-size-50', 'leading-5']],
    ['medium', ['font-medium', 'text-size-50', 'leading-5']],
    ['large', ['font-medium', 'text-size-100']]
  ] as const)('size %s sets the Lamb typography', (size, expected) => {
    renderTooltip({ size })

    expect(screen.getByRole('tooltip')).toHaveClass(...expected)
  })

  it('opens on hover and escape closes it even with focus outside the trigger', async () => {
    const user = userEvent.setup()
    renderTooltip()
    const panel = screen.getByRole('tooltip')

    await user.hover(screen.getByRole('button', { name: 'Editar' }))

    expect(panel).toHaveAttribute('data-open', 'true')
    expect(document.body).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(panel).toHaveAttribute('data-open', 'false')
  })

  it('escape closes a tooltip opened by keyboard focus', async () => {
    const user = userEvent.setup()
    renderTooltip()

    await user.tab()

    expect(screen.getByRole('tooltip')).toHaveAttribute('data-open', 'true')

    await user.keyboard('{Escape}')

    expect(screen.getByRole('tooltip')).toHaveAttribute('data-open', 'false')
  })

  it('merges aria-describedby with the ids the trigger already had', () => {
    render(
      <Tooltip content="Editar membro">
        <button aria-describedby="hint" type="button">
          Editar
        </button>
      </Tooltip>
    )
    const trigger = screen.getByRole('button', { name: 'Editar' })
    const tooltipId = screen.getByRole('tooltip').id

    expect(tooltipId).not.toBe('')
    expect(trigger).toHaveAttribute('aria-describedby', `hint ${tooltipId}`)
  })
})
