import { Outlet } from 'react-router-dom'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 overflow-x-hidden">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
