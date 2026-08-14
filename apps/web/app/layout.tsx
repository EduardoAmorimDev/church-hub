import { Inter, Oswald } from 'next/font/google'

import 'material-symbols'
import './styles.css'
import { ToastContainer } from '@church/ui/molecules/Toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald'
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-br"
      className={`${inter.variable} ${oswald.variable} text antialiased`}
    >
      <ToastContainer />
      <body>{children}</body>
    </html>
  )
}
