import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from './Toggle'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM state, not computed styles.
const switchOf = () => screen.getByRole('switch')
const thumbOf = () => switchOf().firstElementChild
const rowOf = () => switchOf().parentElement

const deferred = () => {
  let resolve: () => void = () => undefined
  let reject: (reason: Error) => void = () => undefined
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, reject, resolve }
}

describe('Toggle', () => {
  it('labelled switch (C32)', async () => {
    const user = userEvent.setup()
    render(<Toggle label="Lembrete de relatório" />)
    const control = screen.getByRole('switch', {
      name: 'Lembrete de relatório'
    })

    expect(control.tagName).toBe('BUTTON')
    expect(control).toHaveAttribute('type', 'button')
    expect(control).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByText('Lembrete de relatório'))
    expect(control).toHaveAttribute('aria-checked', 'true')
  })

  it('medium size (C33)', () => {
    render(<Toggle label="Lembrete" />)

    expect(switchOf()).toHaveClass(
      'w-10',
      'h-6',
      'border-2',
      'border-control',
      'bg-surface',
      'rounded-full'
    )
    expect(thumbOf()).toHaveClass(
      'size-4',
      'top-0.5',
      'left-0.5',
      'bg-neutral-67'
    )
    expect(screen.getByText('Lembrete')).toHaveClass(
      'text-size-75',
      'font-medium'
    )
    expect(rowOf()).toHaveClass('gap-3')
  })

  it.each([
    ['small', ['w-8', 'h-5'], 'size-3', ['text-size-50', 'leading-5']],
    ['large', ['w-13', 'h-8'], 'size-6', ['text-size-100', 'leading-8']]
  ] as const)(
    'small and large sizes (C34): %s',
    (size, track, thumb, labelClasses) => {
      render(<Toggle label="Lembrete" size={size} />)

      expect(switchOf()).toHaveClass(...track)
      expect(thumbOf()).toHaveClass(thumb)
      expect(screen.getByText('Lembrete')).toHaveClass(...labelClasses)
    }
  )

  it.each([
    ['small', 'translate-x-3'],
    ['medium', 'translate-x-4'],
    ['large', 'translate-x-5']
  ] as const)('on state (C35): %s', (size, shift) => {
    render(<Toggle defaultChecked label="Lembrete" size={size} />)

    expect(switchOf()).toHaveAttribute('aria-checked', 'true')
    expect(switchOf()).toHaveClass('bg-action-primary', 'border-neutral-999')
    expect(thumbOf()).toHaveClass('bg-neutral-00', 'text-neutral-999', shift)
    expect(screen.getByText('check')).toBeInTheDocument()
  })

  it('accent on state (C36)', () => {
    render(<Toggle color="accent" defaultChecked label="Lembrete" />)

    expect(switchOf()).toHaveClass('bg-accent-solid', 'border-blue-67')
    expect(thumbOf()).toHaveClass('bg-neutral-00', 'text-accent')
    expect(screen.getByText('check')).toBeInTheDocument()
  })

  it('toggles by click, Space and Enter (C37)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    render(<Toggle label="Lembrete" onCheckedChange={onCheckedChange} />)

    await user.click(switchOf())
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(switchOf()).toHaveAttribute('aria-checked', 'true')

    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    expect(switchOf()).toHaveAttribute('aria-checked', 'false')

    await user.keyboard('{Enter}')
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(switchOf()).toHaveAttribute('aria-checked', 'true')
    expect(onCheckedChange).toHaveBeenCalledTimes(3)
  })

  it('controlled only follows the prop (C37)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    const { rerender } = render(
      <Toggle
        checked={false}
        label="Lembrete"
        onCheckedChange={onCheckedChange}
      />
    )

    await user.click(switchOf())
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(switchOf()).toHaveAttribute('aria-checked', 'false')

    rerender(
      <Toggle checked label="Lembrete" onCheckedChange={onCheckedChange} />
    )
    expect(switchOf()).toHaveAttribute('aria-checked', 'true')
  })

  it('hover and pressed (C38)', () => {
    const { rerender } = render(<Toggle label="Lembrete" />)
    expect(switchOf()).toHaveClass('hover:border-neutral-83', 'hover:bg-hover')
    expect(thumbOf()).toHaveClass('group-active/track:w-5')

    rerender(<Toggle checked label="Lembrete" />)
    expect(switchOf()).toHaveClass(
      'not-disabled:hover:border-neutral-100',
      'not-disabled:hover:bg-neutral-100'
    )

    rerender(<Toggle checked color="accent" label="Lembrete" />)
    expect(switchOf()).toHaveClass(
      'not-disabled:hover:border-blue-83',
      'not-disabled:hover:bg-blue-83'
    )
  })

  it('description (C39)', () => {
    render(
      <Toggle
        description="Push no domingo às 20h se o relatório não foi enviado."
        label="Lembrete"
      />
    )
    const description = screen.getByText(
      'Push no domingo às 20h se o relatório não foi enviado.'
    )

    expect(description).toHaveClass(
      'text-size-50',
      'font-normal',
      'text-secondary'
    )
    expect(description.parentElement).toHaveClass('gap-0.5')
    expect(switchOf()).toHaveAccessibleDescription(
      'Push no domingo às 20h se o relatório não foi enviado.'
    )
  })

  it('label on the left (C40)', () => {
    render(<Toggle label="Lembrete" labelPosition="left" />)
    const label = screen.getByText('Lembrete')

    expect(rowOf()).toHaveClass('w-full', 'justify-between')
    expect(
      label.compareDocumentPosition(switchOf()) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('state text (C41)', async () => {
    const user = userEvent.setup()
    render(<Toggle label="Lembrete" showStateText />)
    const state = screen.getByText('Desligado')

    expect(state).toHaveAttribute('aria-hidden', 'true')
    expect(state).toHaveClass(
      'text-size-50',
      'font-medium',
      'text-secondary',
      'min-w-16'
    )

    await user.click(switchOf())
    expect(screen.getByText('Ligado')).toBeInTheDocument()
  })

  it.each([
    ['small', 'after:w-11'],
    ['medium', 'after:w-11'],
    ['large', 'after:w-13']
  ] as const)('44px hit area (C42): %s', (size, width) => {
    render(<Toggle label="Lembrete" size={size} />)

    expect(switchOf()).toHaveClass('after:absolute', 'after:h-11', width)
    // invariant: the track's touch area is always on; the 44px row is App
    // density only (lote 2, criterion 44), compiled in styles.spec (C44).
    expect(rowOf()).toHaveClass(
      'min-h-11',
      'panel:not-in-data-[viewport=mobile]:min-h-0',
      'in-data-[viewport=desktop]:min-h-0'
    )
  })

  it('disabled (C43)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    const { rerender } = render(
      <Toggle
        description="Ajuda"
        disabled
        label="Lembrete"
        onCheckedChange={onCheckedChange}
      />
    )

    expect(switchOf()).toBeDisabled()
    expect(switchOf()).toHaveClass(
      'border-neutral-33',
      'bg-disabled',
      'cursor-not-allowed'
    )
    expect(thumbOf()).toHaveClass('bg-neutral-33')
    expect(screen.getByText('Lembrete')).toHaveClass('text-disabled')
    expect(screen.getByText('Ajuda')).toHaveClass('text-disabled')

    await user.click(switchOf())
    await user.click(screen.getByText('Lembrete'))
    await user.tab()
    expect(switchOf()).not.toHaveFocus()
    await user.keyboard(' ')
    await user.keyboard('{Enter}')
    expect(onCheckedChange).not.toHaveBeenCalled()

    rerender(<Toggle checked disabled label="Lembrete" />)
    expect(thumbOf()).toHaveClass('bg-neutral-50')
  })

  it('pending promise keeps the previous state (C44)', async () => {
    const user = userEvent.setup()
    const { promise, resolve } = deferred()
    render(<Toggle label="Lembrete" onCheckedChange={() => promise} />)

    await user.click(switchOf())

    expect(switchOf()).toHaveAttribute('aria-checked', 'false')
    expect(switchOf()).toHaveAttribute('aria-busy', 'true')
    expect(switchOf()).toHaveClass('cursor-progress')
    expect(switchOf()).toHaveFocus()
    expect(thumbOf()?.querySelector('[data-spinner]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Salvando…')

    await act(async () => resolve())

    expect(switchOf()).toHaveAttribute('aria-checked', 'true')
    expect(switchOf()).not.toHaveAttribute('aria-busy')
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('rejected promise changes nothing (C45)', async () => {
    const user = userEvent.setup()
    const { promise, reject } = deferred()
    const unhandled = jest.fn()
    process.on('unhandledRejection', unhandled)
    render(<Toggle label="Lembrete" onCheckedChange={() => promise} />)

    await user.click(switchOf())
    await act(async () => reject(new Error('falhou')))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(switchOf()).toHaveAttribute('aria-checked', 'false')
    expect(switchOf()).not.toHaveAttribute('aria-busy')
    expect(unhandled).not.toHaveBeenCalled()
    process.off('unhandledRejection', unhandled)
  })

  it('ignores input while pending (C46)', async () => {
    const user = userEvent.setup()
    const { promise, resolve } = deferred()
    const onCheckedChange = jest.fn(() => promise)
    render(<Toggle label="Lembrete" onCheckedChange={onCheckedChange} />)

    await user.click(switchOf())
    await user.click(switchOf())
    await user.keyboard(' ')
    await user.keyboard('{Enter}')

    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    await act(async () => resolve())
  })

  it('loading prop (C47)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    render(
      <Toggle label="Lembrete" loading onCheckedChange={onCheckedChange} />
    )

    expect(switchOf()).toHaveAttribute('aria-busy', 'true')
    expect(switchOf()).toHaveAttribute('aria-checked', 'false')
    expect(switchOf()).toHaveClass('cursor-progress')
    expect(thumbOf()?.querySelector('[data-spinner]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Salvando…')

    await user.click(switchOf())
    expect(switchOf()).toHaveFocus()
    await user.keyboard(' ')
    await user.keyboard('{Enter}')
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
