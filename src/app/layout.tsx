import type { Metadata, Viewport } from 'next'
import { Poppins, Geist } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ENCUADRE | Alinea la visión antes de tomar la foto',
  description:
    'La plataforma que alinea la visión del fotógrafo y el cliente antes de la sesión. Reduce revisiones, aumenta la satisfacción.',
  manifest: '/manifest.json',
  icons: {
    icon: '/brand/symbol.png',
    apple: '/brand/symbol.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#080714',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${geist.variable} dark h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#080714] text-[#F7F7FB] antialiased">
        {children}
      </body>
    </html>
  )
}
