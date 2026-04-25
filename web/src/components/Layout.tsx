import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, LogOut, WalletCards, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export function Layout() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Clientes', path: '/clients', icon: <Users className="w-5 h-5" /> },
    { name: 'Cobranças', path: '/charges', icon: <Receipt className="w-5 h-5" /> },
  ]

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform -rotate-6">
          <WalletCards className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Cobrei</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map(link => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                {link.icon}
              </span>
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <WalletCards className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">Cobrei</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 flex flex-col border-t border-slate-100">
          <SidebarContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
