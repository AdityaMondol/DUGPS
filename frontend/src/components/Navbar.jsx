import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, GraduationCap, Globe, LogOut, User, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'bn' ? 'en' : 'bn'
    i18n.changeLanguage(newLang)
    localStorage.setItem('i18nextLng', newLang)
    // The language transition is handled by the LanguageTransition component
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
    toast.success(t('nav.logout'))
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/teachers', label: t('nav.teachers') },
    { to: '/notice', label: t('nav.notice') },
    { to: '/feedback', label: t('nav.feedback') },
    { to: '/media', label: t('nav.media') },
    { to: '/contact', label: t('nav.contact') },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="glass-effect sticky top-0 z-50 shadow-sm border-b border-white/10 dark:border-slate-800/50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur-lg group-hover:bg-indigo-500/30 transition-all" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 p-2.5 rounded-2xl shadow-lg border border-white/20">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Darul Ulum
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mt-1">
                Government Primary School
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'nav-link-active' : ''}`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section / Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
                aria-label={t('toggleTheme')}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleLanguage}
                className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm"
                aria-label={t('toggleLanguage')}
              >
                <Globe className="w-5 h-5" />
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs hidden sm:block">
                    {user?.firstName}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 glass-effect !bg-white/90 dark:!bg-slate-900/90 rounded-[1.5rem] shadow-2xl py-3 border border-slate-200/50 dark:border-slate-800/50"
                    >
                      <div className="px-5 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logged in as</div>
                         <div className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.email}</div>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-200 font-bold transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs">{t('nav.dashboard')}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 font-bold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-xs">{t('nav.logout')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-5 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/signup" className="btn-primary !rounded-xl px-5 py-2 !text-sm shadow-none hover:shadow-indigo-500/20">
                  {t('nav.signup')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-indigo-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar/Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:hidden fixed inset-x-4 top-24 z-50 glass-effect !bg-white/95 dark:!bg-slate-950/95 rounded-[2.5rem] p-8 shadow-2xl border border-white/20"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`text-xl font-black px-4 py-3 rounded-2xl transition-all ${
                      isActive(link.to)
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="btn-secondary !py-4">
                      {t('nav.login')}
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="btn-primary !py-4 shadow-none">
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
