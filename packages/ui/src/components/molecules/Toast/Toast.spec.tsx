import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast, toast, ToastContainer } from './Toast'

describe('Toast', () => {
  it('renders title and description', () => {
    render(<Toast description="Descrição fictícia" title="Título fictício" />)

    expect(screen.getByText('Título fictício')).toBeInTheDocument()
    expect(screen.getByText('Descrição fictícia')).toBeInTheDocument()
  })

  it('closes through the toast context', async () => {
    const user = userEvent.setup()
    const closeToast = jest.fn()

    render(<Toast title="Título fictício" toastProps={{ closeToast }} />)
    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }))

    expect(closeToast).toHaveBeenCalledTimes(1)
  })

  it('styles a shown toast with the radius token and its type colour', async () => {
    render(<ToastContainer />)

    act(() => {
      toast.error({ id: 'toast-ficticio', title: 'Falha fictícia' })
    })

    const title = await screen.findByText('Falha fictícia')
    const toastElement = title.closest('.Toastify__toast')

    expect(toastElement).toHaveClass('rounded-10!', 'p-3!', 'bg-red-67!')
  })
})
