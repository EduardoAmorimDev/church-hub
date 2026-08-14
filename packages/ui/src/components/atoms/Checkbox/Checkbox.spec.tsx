import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

// Tailwind's compiled CSS isn't loaded in jsdom, and jsdom doesn't implement
// real CSS cascade/`getComputedStyle` anyway — so these tests assert on the
// utility class *tokens* the component requests (a reliable proxy for "the
// right rule was authored") and on real DOM state (`data-state`,
// `aria-checked`, rendered glyph text), not on final computed colors.

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
      expect(control).toHaveAttribute('aria-checked', 'false')

      await user.click(control)

      expect(control).toHaveAttribute('aria-checked', 'true')
      expect(control).toHaveAttribute('data-state', 'checked')
    })

    it('toggles via clicking the associated label', async () => {
      const user = userEvent.setup()
      render(<ControlledCheckbox label="Aceito os termos" />)
      const control = screen.getByRole('checkbox')

      await user.click(screen.getByText('Aceito os termos'))

      expect(control).toHaveAttribute('aria-checked', 'true')
    })

    it('is reachable by keyboard and toggles on Space', async () => {
      const user = userEvent.setup()
      render(<ControlledCheckbox label="Aceito" />)
      const control = screen.getByRole('checkbox')

      await user.tab()
      expect(control).toHaveFocus()

      await user.keyboard(' ')

      expect(control).toHaveAttribute('aria-checked', 'true')
    })

    it('requests a visible focus-visible ring, checked or not (FR-012)', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      let control = screen.getByRole('checkbox')
      expect(control.className).toContain('focus-visible:ring-2')
      expect(control.className).toContain('focus-visible:ring-neutral-999')

      // Still present when checked, where the state variants leave no
      // border at all — this is the case a plain "thicken the border"
      // approach couldn't have covered.
      rerender(<Checkbox checked />)
      control = screen.getByRole('checkbox')
      expect(control.className).toContain('focus-visible:ring-2')
    })
  })

  // --- User Story 2: state-driven colors ---------------------------------

  describe('state colors (FR-007, FR-008)', () => {
    it('default state: unchecked shows the neutral ring, checked shows neutral-999', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      let control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:inset-ring-neutral-33'
      )

      rerender(<Checkbox checked />)
      control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-neutral-999'
      )
    })

    it('error state: unchecked border red-67, checked background red-67', () => {
      render(<Checkbox state="error" />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:inset-ring-red-67'
      )
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-red-67'
      )
    })

    it('success state: unchecked border green-67, checked background green-67', () => {
      render(<Checkbox state="success" />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain(
        'not-disabled:data-[state=unchecked]:inset-ring-green-67'
      )
      expect(control.className).toContain(
        'not-disabled:data-[state=checked]:bg-green-67'
      )
    })

    it('helper text is red-67 for error and green-67 for success, but label stays neutral-100 regardless of state', () => {
      const { rerender } = render(
        <Checkbox helperText="Campo obrigatório" label="Termos" state="error" />
      )
      expect(screen.getByText('Campo obrigatório').className).toContain(
        'text-red-67'
      )
      expect(screen.getByText('Termos').className).toContain('text-neutral-100')

      rerender(
        <Checkbox helperText="Tudo certo" label="Termos" state="success" />
      )
      expect(screen.getByText('Tudo certo').className).toContain(
        'text-green-67'
      )
      expect(screen.getByText('Termos').className).toContain('text-neutral-100')
    })
  })

  // --- User Story 3: indeterminate ---------------------------------------

  describe('indeterminate (FR-005)', () => {
    it('renders the dash glyph instead of the checkmark', () => {
      render(<Checkbox indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control).toHaveAttribute('aria-checked', 'mixed')
      expect(control).toHaveAttribute('data-state', 'indeterminate')
      expect(screen.getByText('horizontal_rule')).toBeInTheDocument()
      expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('takes precedence over checked=true', () => {
      render(<Checkbox checked indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control).toHaveAttribute('data-state', 'indeterminate')
      expect(screen.getByText('horizontal_rule')).toBeInTheDocument()
      expect(screen.queryByText('check')).not.toBeInTheDocument()
    })

    it('shows the checkmark (not the dash) when checked and not indeterminate', () => {
      render(<Checkbox checked />)
      expect(screen.getByText('check')).toBeInTheDocument()
      expect(screen.queryByText('horizontal_rule')).not.toBeInTheDocument()
    })
  })

  // --- User Story 4: disabled ---------------------------------------------

  describe('disabled (FR-009, FR-011, Clarifications Q1)', () => {
    it('checked + disabled shows the flat neutral-67 background and neutral-00 glyph', () => {
      render(<Checkbox checked disabled />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-neutral-67')
      expect(screen.getByText('check').className).toContain('text-neutral-00')
    })

    it('unchecked + disabled shows the flat neutral-67 background with no glyph', () => {
      render(<Checkbox checked={false} disabled />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-neutral-67')
      expect(screen.queryByText('check')).not.toBeInTheDocument()
      expect(screen.queryByText('horizontal_rule')).not.toBeInTheDocument()
    })

    it('indeterminate + disabled shows the flat neutral-67 background and the dash glyph', () => {
      render(<Checkbox disabled indeterminate />)
      const control = screen.getByRole('checkbox')
      expect(control.className).toContain('bg-neutral-67')
      expect(screen.getByText('horizontal_rule')).toBeInTheDocument()
    })

    it('disabled + state="error" gates the error ring behind not-disabled: so it never visually applies', () => {
      // The error ring class is still present in the className string (tv()
      // doesn't strip it — Tailwind resolves the actual cascade), but it
      // MUST be scoped behind `not-disabled:` so the browser never applies
      // it once the control is actually disabled (see research.md R3b) —
      // a bare, unscoped `inset-ring-red-67` here would be a real bug.
      render(<Checkbox disabled state="error" />)
      const control = screen.getByRole('checkbox')
      const classTokens = control.className.split(/\s+/)
      const ringTokens = classTokens.filter(token =>
        token.includes('inset-ring-red-67')
      )
      expect(ringTokens.length).toBeGreaterThan(0)
      expect(ringTokens.every(token => token.startsWith('not-disabled:'))).toBe(
        true
      )
      expect(control.className).toContain('bg-neutral-67')
    })

    it('dims the label and helper text to neutral-67 while disabled, for any state', () => {
      render(
        <Checkbox
          disabled
          helperText="Indisponível"
          label="Aceito"
          state="success"
        />
      )
      expect(screen.getByText('Aceito').className).toContain('text-neutral-67')
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
})
