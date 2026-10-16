import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@church/ui/atoms/Button'
import { MenuDropdown, MenuDropdownProps, MenuItemProps } from '.'

// why: jsdom loads no Tailwind CSS, so these specs assert the utility classes
// requested and the real DOM semantics, not computed styles.
const items = (onSelect = jest.fn()): MenuItemProps[] => [
  { iconName: 'edit', label: 'Editar', onSelect },
  { iconName: 'content_copy', label: 'Duplicar', onSelect },
  { disabled: true, iconName: 'share', label: 'Compartilhar', onSelect },
  { color: 'destructive', iconName: 'delete', label: 'Excluir', onSelect }
]

const renderMenu = (props: Partial<MenuDropdownProps> = {}) =>
  render(
    <div>
      <MenuDropdown
        items={items()}
        label="Ações da pessoa"
        trigger={<Button>Mais opções</Button>}
        {...props}
      />
      <button type="button">Fora do menu</button>
    </div>
  )

const triggerOf = () => screen.getByRole('button', { name: 'Mais opções' })
const menuOf = () => screen.getByRole('menu', { name: 'Ações da pessoa' })
const itemOf = (name: string) => screen.getByRole('menuitem', { name })

describe('MenuDropdown', () => {
  it('closed trigger (C77)', () => {
    renderMenu()
    const trigger = triggerOf()

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens below the trigger (C78)', async () => {
    const user = userEvent.setup()
    const { unmount } = renderMenu()
    const trigger = triggerOf()

    await user.click(trigger)
    const menu = menuOf()

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(menu).toHaveAttribute('id', trigger.getAttribute('aria-controls'))
    expect(menu.parentElement).toHaveClass('relative', 'inline-flex')
    expect(menu.parentElement).toContainElement(trigger)
    expect(menu).toHaveClass(
      'absolute',
      'top-full',
      'mt-1',
      'left-0',
      'min-w-45',
      'p-2',
      'rounded-2xl',
      'bg-surface',
      'shadow-elevation-low-bottom-12',
      'border',
      'border-default'
    )
    expect(menu).not.toHaveClass('right-0')
    expect(itemOf('Editar')).toHaveFocus()
    unmount()

    renderMenu({ align: 'end' })
    await user.click(triggerOf())
    expect(menuOf()).toHaveClass('right-0')
    expect(menuOf()).not.toHaveClass('left-0')
  })

  it('side: bottom by default, top opens above the trigger', async () => {
    const user = userEvent.setup()
    const { unmount } = renderMenu()

    await user.click(triggerOf())
    expect(menuOf()).toHaveClass('top-full', 'mt-1')
    expect(menuOf()).not.toHaveClass('bottom-full')
    unmount()

    renderMenu({ side: 'top' })
    await user.click(triggerOf())
    expect(menuOf()).toHaveClass('bottom-full', 'mb-1')
    expect(menuOf()).not.toHaveClass('top-full')
    expect(menuOf()).not.toHaveClass('mt-1')
  })

  it('menu item (C79)', async () => {
    const user = userEvent.setup()
    renderMenu({
      items: [{ active: true, iconName: 'edit', label: 'Editar' }]
    })
    await user.click(triggerOf())
    const item = itemOf('Editar')
    const icon = item.querySelector('.material-symbols-outlined')

    expect(item.tagName).toBe('BUTTON')
    expect(item).toHaveAttribute('type', 'button')
    expect(item).toHaveAttribute('tabindex', '-1')
    expect(item).toHaveClass(
      'min-h-9',
      'px-3',
      'py-2',
      'gap-2',
      'rounded-lg',
      'text-size-50',
      'font-medium',
      'text-primary',
      'not-disabled:hover:bg-hover',
      'focus-visible:bg-hover',
      'not-disabled:active:bg-selected',
      'data-[active=true]:bg-selected'
    )
    expect(item).toHaveAttribute('data-active', 'true')
    expect(icon).toHaveTextContent('edit')
    expect(icon).toHaveClass('text-icon-20!')
  })

  it('destructive and disabled items (C80)', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderMenu({ items: items(onSelect) })
    await user.click(triggerOf())
    const remove = itemOf('Excluir')
    const share = itemOf('Compartilhar')

    expect(remove).toHaveClass('text-danger')
    expect(remove).not.toHaveClass('text-primary')
    expect(share).toBeDisabled()
    expect(share).toHaveClass('disabled:text-disabled')

    await user.click(share)
    expect(onSelect).not.toHaveBeenCalled()

    itemOf('Duplicar').focus()
    await user.keyboard('{ArrowDown}')
    expect(remove).toHaveFocus()
  })

  it('arrow navigation wraps (C81)', async () => {
    const user = userEvent.setup()
    renderMenu()
    await user.click(triggerOf())

    expect(itemOf('Editar')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(itemOf('Duplicar')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(itemOf('Excluir')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(itemOf('Editar')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(itemOf('Excluir')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(itemOf('Duplicar')).toHaveFocus()
  })

  it('selecting closes (C82)', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderMenu({ items: items(onSelect) })

    await user.click(triggerOf())
    await user.click(itemOf('Duplicar'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledTimes(1)

    await user.click(triggerOf())
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledTimes(2)

    await user.click(triggerOf())
    await user.keyboard(' ')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledTimes(3)
    expect(triggerOf()).toHaveAttribute('aria-expanded', 'false')
  })

  it('dismissal (C83)', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(triggerOf())
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(triggerOf()).toHaveFocus()

    await user.click(triggerOf())
    expect(menuOf()).toBeInTheDocument()
    await user.tab()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(triggerOf())
    expect(menuOf()).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fora do menu' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(triggerOf())
    await user.click(triggerOf())
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('esc stays in the menu (C6)', async () => {
    const user = userEvent.setup()
    const onParentKeyDown = jest.fn()
    render(
      <div onKeyDown={event => onParentKeyDown(event.key)}>
        <MenuDropdown
          items={items()}
          label="Ações da pessoa"
          trigger={<Button>Mais opções</Button>}
        />
      </div>
    )

    await user.click(triggerOf())
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onParentKeyDown).toHaveBeenCalledWith('ArrowDown')
    expect(onParentKeyDown).not.toHaveBeenCalledWith('Escape')

    await user.keyboard('{Escape}')
    expect(onParentKeyDown).toHaveBeenCalledWith('Escape')
  })

  it('no enabled item (C84)', async () => {
    const user = userEvent.setup()
    renderMenu({
      items: [
        { disabled: true, label: 'Editar' },
        { disabled: true, label: 'Excluir' }
      ]
    })

    await user.click(triggerOf())
    const menu = menuOf()
    expect(menu).toHaveFocus()
    expect(menu).toHaveAttribute('tabindex', '-1')

    await user.keyboard('{ArrowDown}')
    expect(menu).toHaveFocus()
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(2)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(triggerOf()).toHaveFocus()
  })

  it('C18a strategy="fixed": placed from the trigger rect, still selectable', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    renderMenu({
      align: 'end',
      items: items(onSelect),
      strategy: 'fixed'
    })
    jest.spyOn(triggerOf(), 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      height: 32,
      left: 900,
      right: 932,
      top: 108,
      width: 32,
      x: 900,
      y: 108,
      toJSON: () => ({})
    })

    await user.click(triggerOf())
    const menu = menuOf()

    expect(menu).toHaveClass('fixed')
    expect(menu).not.toHaveClass('absolute', 'top-full', 'right-0')
    expect(menu).toHaveStyle({
      top: '144px',
      right: `${window.innerWidth - 932}px`
    })
    expect(menu.parentElement).toContainElement(triggerOf())

    await user.click(itemOf('Duplicar'))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('strategy="fixed" side top: bottom offset from the trigger top', async () => {
    const user = userEvent.setup()
    renderMenu({ side: 'top', strategy: 'fixed' })
    jest.spyOn(triggerOf(), 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      height: 32,
      left: 20,
      right: 52,
      top: 108,
      width: 32,
      x: 20,
      y: 108,
      toJSON: () => ({})
    })

    await user.click(triggerOf())
    expect(menuOf()).toHaveStyle({
      bottom: `${window.innerHeight - 108 + 4}px`,
      left: '20px'
    })
  })
})
