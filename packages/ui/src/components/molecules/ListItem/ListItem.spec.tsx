import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MouseEvent } from 'react'
import { Checkbox } from '@church/ui/atoms/Checkbox'
import { Icon } from '@church/ui/atoms/Icon'
import { ListItem } from './ListItem'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const glyphsOf = (element: Element) =>
  Array.from(element.querySelectorAll('.material-symbols-outlined'))

const chevronOf = (element: Element) =>
  glyphsOf(element).find(glyph => glyph.textContent === 'chevron_right')

const mainOf = (item: HTMLElement) => {
  const main = item.firstElementChild
  if (!(main instanceof HTMLElement)) throw new Error('no main area')
  return main
}

describe('ListItem', () => {
  it('static item (C66)', () => {
    render(
      <ul>
        <ListItem subtitle="12 presentes" title="Relatório de exemplo" />
      </ul>
    )
    const item = screen.getByRole('listitem')
    const main = mainOf(item)
    const title = screen.getByText('Relatório de exemplo')
    const subtitle = screen.getByText('12 presentes')

    expect(item.tagName).toBe('LI')
    expect(main.tagName).toBe('DIV')
    expect(main).toHaveClass('min-h-16', 'px-4', 'py-2', 'gap-3')
    expect(title).toHaveClass('text-size-75', 'font-medium', 'truncate')
    expect(subtitle).toHaveClass(
      'text-size-50',
      'font-normal',
      'text-secondary',
      'truncate'
    )
    expect(title.parentElement).toBe(subtitle.parentElement)
    expect(title.parentElement).toHaveClass('flex-col', 'gap-0.5')
    expect(chevronOf(item)).toBeUndefined()
    expect(within(item).queryByRole('link')).not.toBeInTheDocument()
    expect(within(item).queryByRole('button')).not.toBeInTheDocument()
  })

  it('leading and trailing (C67)', () => {
    render(
      <ul>
        <ListItem
          leading={<Icon name="description" />}
          title="Relatório de exemplo"
          trailing="2 pendências"
        />
      </ul>
    )
    const main = mainOf(screen.getByRole('listitem'))
    const [leading, content, trailing] = Array.from(main.children)

    expect(leading).toHaveClass(
      'text-secondary',
      '[&_.material-symbols-outlined]:text-icon-24!',
      '[&_.material-symbols-outlined]:text-current'
    )
    expect(
      leading?.querySelector('.material-symbols-outlined')
    ).toHaveTextContent('description')
    expect(content).toHaveTextContent('Relatório de exemplo')
    expect(trailing).toHaveTextContent('2 pendências')
    expect(trailing).toHaveClass(
      'text-size-50',
      'font-normal',
      'text-secondary',
      'gap-2'
    )
  })

  it('link item (C68)', () => {
    render(
      <ul>
        <ListItem href="/relatorios/1" title="Relatório de exemplo" />
      </ul>
    )
    const link = screen.getByRole('link', { name: /Relatório de exemplo/ })
    const chevron = chevronOf(link)

    expect(link).toHaveAttribute('href', '/relatorios/1')
    expect(link.parentElement?.tagName).toBe('LI')
    expect(link).toHaveClass(
      'flex-1',
      'cursor-pointer',
      'rounded-lg',
      'hover:bg-hover',
      'active:bg-selected'
    )
    expect(chevron).toBeDefined()
    expect(chevron).toHaveClass('text-icon-20!', 'text-secondary')
    expect(chevron?.parentElement).toBe(link)
    expect(link.lastElementChild).toBe(chevron)
  })

  it('button item (C69)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(
      <ul>
        <ListItem onClick={onClick} title="Pessoa Fictícia" />
      </ul>
    )
    const button = screen.getByRole('button', { name: /Pessoa Fictícia/ })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass(
      'cursor-pointer',
      'rounded-lg',
      'hover:bg-hover',
      'active:bg-selected'
    )
    expect(chevronOf(button)).toBeDefined()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('inner focus ring (C70)', async () => {
    const user = userEvent.setup()
    render(
      <ul>
        <ListItem href="/relatorios/1" title="Relatório de exemplo" />
      </ul>
    )
    const link = screen.getByRole('link')

    await user.tab()
    expect(link).toHaveFocus()
    expect(link).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-focus-ring',
      'focus-visible:-outline-offset-2'
    )
  })

  it('density (C71)', () => {
    const { rerender } = render(
      <ul>
        <ListItem density="compact" title="Pessoa Fictícia" />
      </ul>
    )
    const title = () => screen.getByText('Pessoa Fictícia')
    const main = () => mainOf(screen.getByRole('listitem'))

    expect(main()).toHaveClass('min-h-12')
    expect(main()).not.toHaveClass('min-h-16')
    expect(title()).toHaveClass('text-size-50', 'leading-5')
    expect(title()).not.toHaveClass('text-size-75')

    rerender(
      <ul>
        <ListItem density="comfortable" title="Pessoa Fictícia" />
      </ul>
    )
    expect(main()).toHaveClass('min-h-18')
    expect(main()).not.toHaveClass('min-h-16')
    expect(title()).toHaveClass('text-size-75')
  })

  it('divider (C72)', () => {
    const { rerender } = render(
      <ul>
        <ListItem title="Pessoa Fictícia" />
      </ul>
    )
    const divider = [
      'not-last:after:absolute',
      'not-last:after:left-4',
      'not-last:after:right-0',
      'not-last:after:bottom-0',
      'not-last:after:h-0',
      'not-last:after:border-b',
      'not-last:after:border-default'
    ]

    expect(screen.getByRole('listitem')).toHaveClass(...divider)

    rerender(
      <ul>
        <ListItem divider={false} title="Pessoa Fictícia" />
      </ul>
    )
    divider.forEach(name =>
      expect(screen.getByRole('listitem')).not.toHaveClass(name)
    )
  })

  it('selected (C73)', () => {
    render(
      <ul>
        <ListItem href="/pessoas/1" selected title="Pessoa Fictícia" />
      </ul>
    )
    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('aria-current', 'true')
    expect(link).toHaveClass('bg-selected')
  })

  it('disabled (C74)', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const navigation = jest.fn((event: globalThis.MouseEvent) =>
      event.defaultPrevented ? 'blocked' : 'navigated'
    )
    const { rerender } = render(
      <ul>
        <ListItem
          disabled
          href="/relatorios/1"
          onClick={onClick}
          subtitle="12 presentes"
          title="Relatório de exemplo"
        />
      </ul>
    )
    const main = mainOf(screen.getByRole('listitem'))
    document.addEventListener('click', navigation)

    expect(main.tagName).toBe('A')
    expect(main).not.toHaveAttribute('href')
    expect(main).toHaveAttribute('aria-disabled', 'true')
    expect(main).toHaveClass('text-disabled')
    expect(main).not.toHaveClass('hover:bg-hover', 'cursor-pointer')
    expect(screen.getByText('12 presentes')).toHaveClass('text-disabled')

    await user.click(main)
    expect(onClick).not.toHaveBeenCalled()
    expect(navigation).toHaveReturnedWith('blocked')
    document.removeEventListener('click', navigation)

    rerender(
      <ul>
        <ListItem disabled onClick={onClick} title="Pessoa Fictícia" />
      </ul>
    )
    const button = screen.getByRole('button', { name: /Pessoa Fictícia/ })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('label row toggles the checkbox (C75)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()
    render(
      <ul>
        <ListItem
          as="label"
          leading={
            <Checkbox
              aria-label="Pessoa Fictícia"
              onCheckedChange={onCheckedChange}
            />
          }
          subtitle="Grupo Exemplo"
          title="Pessoa Fictícia"
        />
      </ul>
    )
    const main = mainOf(screen.getByRole('listitem'))
    const checkbox = screen.getByRole('checkbox', { name: 'Pessoa Fictícia' })

    expect(main.tagName).toBe('LABEL')
    expect(main).toHaveClass('cursor-pointer', 'hover:bg-hover')
    expect(chevronOf(main)).toBeUndefined()

    await user.click(screen.getByText('Grupo Exemplo'))
    expect(checkbox).toBeChecked()
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByText('Pessoa Fictícia'))
    expect(checkbox).not.toBeChecked()
  })

  it('chevron and action (C76)', async () => {
    const user = userEvent.setup()
    const onAction = jest.fn((event: MouseEvent<HTMLButtonElement>) =>
      event.stopPropagation()
    )
    const onClick = jest.fn()
    const { rerender } = render(
      <ul>
        <ListItem
          action={
            <button onClick={onAction} type="button">
              Mais opções
            </button>
          }
          chevron={false}
          href="/pessoas/1"
          onClick={onClick}
          title="Pessoa Fictícia"
        />
      </ul>
    )
    const item = screen.getByRole('listitem')
    const link = screen.getByRole('link')
    const action = screen.getByRole('button', { name: 'Mais opções' })

    expect(chevronOf(item)).toBeUndefined()
    expect(link).not.toContainElement(action)
    expect(action.parentElement?.parentElement).toBe(item)
    expect(action.parentElement).toHaveClass('pr-2')

    await user.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()

    rerender(
      <ul>
        <ListItem chevron title="Pessoa Fictícia" />
      </ul>
    )
    expect(chevronOf(screen.getByRole('listitem'))).toBeDefined()
  })
})
