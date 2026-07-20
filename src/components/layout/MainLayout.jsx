import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full px-4 pt-0">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
