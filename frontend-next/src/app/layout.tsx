import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from '@/contexts/AppContext'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VITON - Virtual Fashion Try-On',
  description: 'Experience fashion like never before with AI-powered virtual try-on',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  )
}