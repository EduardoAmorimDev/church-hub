import 'material-symbols'
import './styles.css'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light pink">
      <body>{children}</body>
    </html>
  )
}
