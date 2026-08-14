import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

// why: jsdom loads no Tailwind CSS and has no cascade, so these specs assert
// the utility classes requested and real DOM state, not computed colours.

// A tiny controlled wrapper so click/keyboard interaction tests can assert
// the resulting `checked` value actually round-trips through `onCheckedChange`.
function ControlledCheckbox(
  props: Omit<Parameters<typeof Checkbox>[0], 'checked' | 'onCheckedChange'> & {
    defaultCheckedValue?: boolean
  }
) {
  const { defaultCheckedValue = false, ...rest } = props
  const [checked, setChecked] = useState(defaultCheckedValue)
  return <Checkbox {...rest} checked={checked} onCheckedChange={setChecked} />
}

describe('Checkbox', () => {
  // --- User Story 1: sizes, optional label/helperText, toggling ---------

  describe('sizes (FR-001, FR-004)', () => {
    it.each([
      ['small', 'size-4', 'rounded-md', 'text-size-50'],
      ['medium', 'size-6', 'rounded-lg', 'text-size-75'],
      ['large', 'size-8', 'rounded-10', 'text-size-100']
    ] as const)(
      'size=%s renders a %s box with %s corners and %s label text',
      (size, boxClass, radiusClass, labelTextClass) => {
        render(<Checkbox label="Aceito os termos" size={size} />)
        const control = screen.getByRole('checkbox')
        expect(control.className).toContain(boxClass)
        expect(control.className).toContain(radiusClass)
        expect(screen.getByText('Aceito os termos').className).toContain(
          labelTextClass
        )
      }
    )
  })

  describe('optional label/helperText (FR-002, FR-003)', () => {
    it('renders only the checkbox control when neither label nor helperText is given', () => {
      render(<Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      // No other text nodes besides the (empty) control itself.
      expect(document.body.querySelectorAll('label').length).toBe(0)
    })

    it('renders the label when given', () => {
      render(<Checkbox label="Receber novidades" />)
      expect(screen.getByText('Receber novidades')).toBeInTheDocument()
    })

    it('renders the helper text when given', () => {
      render(<Checkbox helperText="Você pode alterar isso depois" />)
      expect(
        screen.getByText('Você pode alterar isso depois')
      ).toBeInTheDocument()
    })

    it('renders neither label nor helper text when omitted, even together', () => {
      render(<Checkbox />)
      expect(screen.queryByText(/./)).not.toBeInTheDocument()
    })
  })

  describe('toggling (FR-010, FR-012, FR-013)', () => {
    it('toggles via clicking the control itself', async () => {
      const user = userEvent.setup()
      render(<ControlledCheckbox label="Aceito" />)
      const control = screen.getByRole('checkbox')
      expect(control).not.toBeChecked()

      await user.click(control)

      expect(control).toBeChecked()
      expect(control).toHaveAttribute('data-state', 'checked')
    })

    it('toggles via clicking the associated label', async () => {
      const user = userEvent.setup()
      render(<ControlledCheckbox label="Aceito os termos" />)
      const control = screen.getByRole('checkbox')

      await user.click(screen.getByText('Aceito os termos'))

      expect(control).toBeChecked()
    })

    it('is reachable by keyboard and toggles on Space', async () => {
      const user = userEvent.setup()
      render(<ControlledCheckbox label="Aceito" />)
      const control = screen.getByRole('checkbox')

      await user.tab()
      expect(control).toHaveFocus()

      await user.keyboard(' ')

      expect(control).toBeChecked()
    })

    it('requests a visible focus-visible ring, checked or not (FR-012)', () => {
      // why: criterion 4 moved the ring to the global `:focus-visible`
      // outline in styles.css, so the control must never suppress it.
      const { rerender } = render(<Checkbox checked={false} />)
      let control = screen.getByRole('checkbox')
      expect(control.className).not.toMatch(/outline-(none|0|hidden)/)

      rerender(<Checkbox checked />)
      control = screen.getByRole('checkbox')
      expect(control.className).not.toMatch(/outline-(none|0|hidden)/)
    })
  })

  // --- User Story 2: state-driven colors ---------------------------------

  describe('state colors (FR-007, FR-008)', () => {
    it('default state: unchecked shows the control border, checked shows neutral-999', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      let control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:border-control'
      )

      rerender(<Checkbox checked />)
      control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-neutral-999'
      )
    })

    it('error state: unchecked border danger-solid (red-67), checked background danger-solid', () => {
      render(<Checkbox state="error" />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:border-red-67'
      )
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-danger-solid'
      )
    })

    it('success state: unchecked border positive-solid (green-83), checked background positive-solid', () => {
      render(<Checkbox state="success" />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:border-green-83'
      )
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-positive-solid'
      )
    })

    it('helper text is red-67 for error and green-67 for success, but label stays text-primary regardless of state', () => {
      const { rerender } = render(
        <Checkbox helperText="Campo obrigatório" label="Termos" state="error" />
      )
      expect(screen.getByText('Campo obrigatório').className).toContain(
        'text-red-67'
      )
      expect(screen.getByText('Termos').className).toContain('text-primary')

      rerender(
        <Checkbox helperText="Tudo certo" label="Termos" state="success" />
      )
      expect(screen.getByText('Tudo certo').className).toContain(
        'text-green-67'
      )
      expect(screen.getByText('Termos').className).toContain('text-primary')
    })
  })

  // --- User Story 3: indeterminate ---------------------------------------

  describe('indeterminate (FR-005)', () => {
    it('renders the dash glyph instead of the checkmark', () => {
      render(<Checkbox indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control).toBePartiallyChecked()
      expect(control).toHaveAttribute('data-state', 'indeterminate')
      expect(screen.getByText('remove')).toBeInTheDocument()
      expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('takes precedence over checked=true', () => {
      render(<Checkbox checked indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control).toHaveAttribute('data-state', 'indeterminate')
      expect(screen.getByText('remove')).toBeInTheDocument()
      expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('shows the checkmark (not the dash) when checked and not indeterminate', () => {
      render(<Checkbox checked />)
      expect(screen.getByText('check')).toBeInTheDocument()
      expect(screen.queryByText('remove')).not.toBeInTheDocument()
    })
  })

  // --- User Story 4: disabled ---------------------------------------------

  describe('disabled (FR-009, FR-011, Clarifications Q1)', () => {
    it('checked + disabled shows the bg-disabled background and text-disabled glyph', () => {
      render(<Checkbox checked disabled />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-disabled')
      expect(screen.getByText('check').className).toContain('text-disabled')
    })

    it('unchecked + disabled shows the bg-disabled background with no glyph', () => {
      render(<Checkbox checked={false} disabled />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-disabled')
      expect(screen.queryByText('check')).not.toBeInTheDocument()
      expect(screen.queryByText('remove')).not.toBeInTheDocument()
    })

    it('indeterminate + disabled shows the bg-disabled background and the dash glyph', () => {
      render(<Checkbox disabled indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-disabled')
      expect(screen.getByText('remove')).toBeInTheDocument()
    })

    it('disabled + state="error" gates the error ring behind not-disabled: so it never visually applies', () => {
      // hazard: tv() keeps the error border class; only the `not-disabled:`
      // scope stops it painting red on a disabled control (research.md R3b).
      render(<Checkbox disabled state="error" />)
      const control = screen.getByRole('checkbox')
      const classTokens = control.className.split(/\s+/)
      const ringTokens = classTokens.filter(token =>
        token.includes('border-red-67')
      )
      expect(ringTokens.length).toBeGreaterThan(0)
      expect(ringTokens.every(token => token.startsWith('not-disabled:'))).toBe(
        true
      )
      expect(control.className).toContain('bg-disabled')
    })

    it('dims the label to text-disabled and helper text to neutral-67 while disabled, for any state', () => {
      render(
        <Checkbox
          disabled
          helperText="Indisponível"
          label="Aceito"
          state="success"
        />
      )
      expect(screen.getByText('Aceito').className).toContain('text-disabled')
      expect(screen.getByText('Indisponível').className).toContain(
        'text-neutral-67'
      )
    })

    it('does not toggle when clicked', async () => {
      const user = userEvent.setup()
      const onCheckedChange = jest.fn()
      render(
        <Checkbox
          checked={false}
          disabled
          label="Aceito"
          onCheckedChange={onCheckedChange}
        />
      )

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByText('Aceito'))

      expect(onCheckedChange).not.toHaveBeenCalled()
    })

    it('is not reachable by Tab while disabled', async () => {
      const user = userEvent.setup()
      render(<Checkbox disabled label="Aceito" />)

      await user.tab()

      expect(screen.getByRole('checkbox')).not.toHaveFocus()
    })
  })

  describe('Lamb alignment (criteria 19 and 20)', () => {
    it('native input inside a label, keeping the current props', async () => {
      const user = userEvent.setup()
      const onCheckedChange = jest.fn()
      const { rerender } = render(
        <Checkbox
          checked={false}
          helperText="Opcional"
          label="Receber avisos"
          onCheckedChange={onCheckedChange}
          size="large"
          state="success"
        />
      )
      const control = screen.getByRole('checkbox', { name: 'Receber avisos' })

      expect(control.tagName).toBe('INPUT')
      expect(control).toHaveAttribute('type', 'checkbox')
      expect(control.closest('label')).toHaveTextContent('Receber avisos')

      await user.click(control)

      expect(onCheckedChange).toHaveBeenCalledWith(true)

      rerender(<Checkbox indeterminate label="Receber avisos" />)

      expect(screen.getByRole('checkbox')).toBePartiallyChecked()
    })

    it.each([
      ['small', ['size-4', 'rounded-md'], 'text-icon-14!', ['text-size-50']],
      ['medium', ['size-6', 'rounded-lg'], 'text-icon-20!', ['text-size-75']],
      [
        'large',
        ['size-8', 'rounded-10'],
        'text-icon-26!',
        ['text-size-100', 'leading-8']
      ]
    ] as const)(
      'states: %s box, radius, glyph and label',
      (size, boxClasses, glyphClass, labelClasses) => {
        render(<Checkbox checked label="Termos" size={size} />)

        expect(screen.getByRole('checkbox')).toHaveClass(
          ...boxClasses,
          'border-2',
          'duration-250'
        )
        expect(screen.getByText('check')).toHaveClass(
          glyphClass,
          'text-neutral-00'
        )
        expect(screen.getByText('Termos')).toHaveClass(
          'font-medium',
          'text-primary',
          ...labelClasses
        )
      }
    )

    it('states: empty, hover, checked, error, success and disabled colours', () => {
      const { rerender } = render(<Checkbox label="Termos" />)
      const control = () => screen.getByRole('checkbox')

      expect(control()).toHaveClass(
        'not-disabled:data-[state=unchecked]:border-control',
        'not-disabled:data-[state=unchecked]:bg-surface',
        'not-disabled:data-[state=unchecked]:group-hover:border-neutral-83',
        'not-disabled:data-[state=unchecked]:group-hover:bg-hover',
        'not-disabled:data-[state=checked]:bg-neutral-999',
        'not-disabled:data-[state=checked]:border-neutral-999'
      )
      expect(control().closest('label')).toHaveClass('group')

      rerender(<Checkbox label="Termos" state="error" />)
      expect(control()).toHaveClass(
        'not-disabled:data-[state=unchecked]:border-red-67',
        'not-disabled:data-[state=checked]:bg-danger-solid'
      )

      rerender(<Checkbox label="Termos" state="success" />)
      expect(control()).toHaveClass(
        'not-disabled:data-[state=unchecked]:border-green-83',
        'not-disabled:data-[state=checked]:bg-positive-solid'
      )

      rerender(<Checkbox checked disabled label="Termos" />)
      expect(control()).toHaveClass('border-neutral-33', 'bg-disabled')
      expect(screen.getByText('check')).toHaveClass('text-disabled')
      expect(screen.getByText('Termos')).toHaveClass('text-disabled')
    })

    it('helperText is linked by aria-describedby, keeping existing ids', () => {
      render(
        <Checkbox
          aria-describedby="extra"
          helperText="Você pode mudar depois"
          label="Termos"
        />
      )
      const control = screen.getByRole('checkbox')
      const helper = screen.getByText('Você pode mudar depois')

      expect(helper.id).not.toBe('')
      expect(control).toHaveAttribute('aria-describedby', `extra ${helper.id}`)
    })

    it('helperText alone is the accessible description', () => {
      render(<Checkbox helperText="Você pode mudar depois" label="Termos" />)

      expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
        'Você pode mudar depois'
      )
    })

    it('state="error" marks aria-invalid="true", other states do not', () => {
      const { rerender } = render(
        <Checkbox helperText="Obrigatório" label="Termos" state="error" />
      )

      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      )

      rerender(
        <Checkbox helperText="Tudo certo" label="Termos" state="success" />
      )

      expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-invalid')
    })

    it('label click toggles from any point of the label, uncontrolled too', async () => {
      const user = userEvent.setup()
      render(<Checkbox helperText="Detalhe" label="Termos" />)
      const control = screen.getByRole('checkbox')
      const label = control.closest('label')

      expect(label).not.toBeNull()
      if (label) await user.click(label)

      expect(control).toBeChecked()

      await user.click(screen.getByText('Termos'))

      expect(control).not.toBeChecked()
    })
  })
})
