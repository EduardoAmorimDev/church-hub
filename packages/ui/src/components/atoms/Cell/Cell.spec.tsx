import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Cell } from './Cell'
import { Icon } from '../Icon'
import { Tag } from '../Tag'

// Tailwind emits no CSS under jsdom, so every visual assertion here checks the
// class tokens the component resolves to, never a computed style. Same approach
// as Checkbox.spec.tsx.
const containerOf = (element: HTMLElement) => element.parentElement

describe('Cell', () => {
  describe('dimensions (FR-003)', () => {
    it('renders a heading default cell 40px tall with 8px/12px padding', () => {
      render(<Cell heading label="Nome" type="default" />)
      const container = screen.getByText('Nome').closest('div')?.parentElement

      expect(container?.className).toContain('h-10')
      expect(container?.className).toContain('px-2')
      expect(container?.className).toContain('py-3')
    })

    it('renders a data default cell 48px tall with 8px padding', () => {
      render(<Cell label="Ana Beatriz" type="default" />)
      const container = screen
        .getByText('Ana Beatriz')
        .closest('div')?.parentElement

      expect(container?.className).toContain('h-12')
      expect(container?.className).toContain('p-2')
    })

    it.each([[true], [false]])(
      'renders a check cell as a 32px box when heading=%s',
      heading => {
        render(
          <Cell
            aria-label="Selecionar"
            checked={false}
            heading={heading}
            type="check"
          />
        )
        const container = containerOf(
          screen.getByRole('checkbox').parentElement as HTMLElement
        )?.parentElement

        expect(container?.className).toContain('size-8')
      }
    )

    it('renders tag and action cells 48px tall', () => {
      const { rerender } = render(<Cell tag={<Tag>Ativo</Tag>} type="tag" />)
      expect(screen.getByText('Ativo').parentElement?.className).toContain(
        'h-12'
      )

      rerender(
        <Cell
          actions={[
            {
              'aria-label': 'Editar',
              icon: <Icon name="edit" />,
              onClick: () => {}
            }
          ]}
          type="action"
        />
      )
      const actionContainer =
        screen.getByRole('button').parentElement?.parentElement

      expect(actionContainer?.className).toContain('h-12')
    })
  })

  describe('typography and colour (FR-004)', () => {
    it('renders the heading label medium weight, 12px, neutral-67', () => {
      render(<Cell heading label="Cargo" type="default" />)
      const label = screen.getByText('Cargo')

      expect(label.className).toContain('font-medium')
      expect(label.className).toContain('text-size-25')
      expect(label.className).toContain('text-neutral-67')
    })

    it('renders the primary line 14px neutral-83 and the secondary 12px neutral-67', () => {
      render(<Cell label="Ana Beatriz" paragraph="Diaconia" type="default" />)

      expect(screen.getByText('Ana Beatriz').className).toContain(
        'text-size-50'
      )
      expect(screen.getByText('Ana Beatriz').className).toContain(
        'text-neutral-83'
      )
      expect(screen.getByText('Diaconia').className).toContain('text-size-25')
      expect(screen.getByText('Diaconia').className).toContain(
        'text-neutral-67'
      )
    })
  })

  describe('optional secondary line (FR-005)', () => {
    it('renders nothing for the secondary line when paragraph is omitted', () => {
      render(<Cell label="Ana Beatriz" type="default" />)
      const content = screen.getByText('Ana Beatriz').parentElement

      expect(content?.childElementCount).toBe(1)
    })

    it('renders the secondary line when paragraph is provided', () => {
      render(<Cell label="Ana Beatriz" paragraph="Diaconia" type="default" />)
      const content = screen.getByText('Ana Beatriz').parentElement

      expect(content?.childElementCount).toBe(2)
    })
  })

  describe('truncation (FR-007)', () => {
    it('truncates the primary line and the heading label on one line', () => {
      const { rerender } = render(<Cell label="Ana Beatriz" type="default" />)
      expect(screen.getByText('Ana Beatriz').className).toContain('truncate')

      rerender(<Cell heading label="Cargo" type="default" />)
      expect(screen.getByText('Cargo').className).toContain('truncate')
    })
  })

  describe('composed components (FR-008)', () => {
    it('renders the checkbox at the 16px size with no label', () => {
      render(<Cell aria-label="Selecionar linha" checked type="check" />)
      const control = screen.getByRole('checkbox')

      expect(control.className).toContain('size-4')
      expect(screen.queryByText('Selecionar linha')).not.toBeInTheDocument()
      expect(control).toHaveAttribute('aria-label', 'Selecionar linha')
    })

    it('renders action buttons at the 32px size', () => {
      render(
        <Cell
          actions={[
            {
              'aria-label': 'Editar',
              icon: <Icon name="edit" />,
              onClick: () => {}
            }
          ]}
          type="action"
        />
      )

      expect(
        screen.getByRole('button', { name: 'Editar' }).className
      ).toContain('p-2')
    })

    it('forwards no size prop of its own — cell heights depend on the fixed sizes', () => {
      render(<Cell aria-label="Selecionar" checked={false} type="check" />)

      expect(screen.getByRole('checkbox').className).not.toContain('size-6')
      expect(screen.getByRole('checkbox').className).not.toContain('size-8')
    })
  })

  describe('icon slots (FR-009, FR-010)', () => {
    it('renders both header icon slots when supplied', () => {
      render(
        <Cell
          heading
          iconLeft={<Icon data-testid="left" name="swap_vert" />}
          iconRight={<Icon data-testid="right" name="more_vert" />}
          label="Nome"
          type="default"
        />
      )

      expect(screen.getByTestId('left')).toBeInTheDocument()
      expect(screen.getByTestId('right')).toBeInTheDocument()
    })

    it('omits each header icon slot independently', () => {
      render(
        <Cell
          heading
          iconRight={<Icon data-testid="right" name="more_vert" />}
          label="Nome"
          type="default"
        />
      )

      expect(screen.queryByTestId('left')).not.toBeInTheDocument()
      expect(screen.getByTestId('right')).toBeInTheDocument()
    })

    it('hides the tag cell icon slot unless supplied', () => {
      const { rerender } = render(<Cell tag={<Tag>Ativo</Tag>} type="tag" />)
      expect(screen.queryByTestId('tag-icon')).not.toBeInTheDocument()

      rerender(
        <Cell
          icon={<Icon data-testid="tag-icon" name="star" />}
          tag={<Tag>Ativo</Tag>}
          type="tag"
        />
      )
      expect(screen.getByTestId('tag-icon')).toBeInTheDocument()
    })
  })

  describe('interaction and defensive rendering', () => {
    it('reports checkbox toggles to the consumer', async () => {
      const user = userEvent.setup()
      const onCheckedChange = jest.fn()
      render(
        <Cell
          aria-label="Selecionar"
          checked={false}
          onCheckedChange={onCheckedChange}
          type="check"
        />
      )

      await user.click(screen.getByRole('checkbox'))

      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('does not toggle a disabled check cell', async () => {
      const user = userEvent.setup()
      const onCheckedChange = jest.fn()
      render(
        <Cell
          aria-label="Selecionar"
          checked={false}
          disabled
          onCheckedChange={onCheckedChange}
          type="check"
        />
      )

      await user.click(screen.getByRole('checkbox'))

      expect(onCheckedChange).not.toHaveBeenCalled()
    })

    it('renders an action cell with an empty action list without throwing', () => {
      expect(() => render(<Cell actions={[]} type="action" />)).not.toThrow()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})
