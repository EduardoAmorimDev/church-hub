import { Noto_Sans, Oswald } from 'next/font/google'

import 'material-symbols'
import './styles.css'
import { ToastContainer } from '~/components/molecules'

const noto_sans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans'
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
      className={`${noto_sans.variable} ${oswald.variable} text antialiased`}
    >
      <ToastContainer />
      <body>{children}</body>
    </html>
  )
}
