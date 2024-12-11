import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '600', '700']
})

export const metadata: Metadata = {
  title: 'Churrasco do Teixeira',
  description: 'Churrascaria Teixiera'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body 
        className={`${montserrat.className} bg-[#ffcbdb] text-black`}
      >
        {children}
      </body>
    </html>
  )
}