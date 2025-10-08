import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, GraduationCap, Globe, LogOut, User, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import toast from 'react-hot-toast'

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
    setTimeout(() => {
      toast.success(t('languageChanged'))
    }, 100)
  }

  const handleLogout = () => {
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
    <nav className="glass-effect sticky top-0 z-50 shadow-lg">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                {t('home.schoolName').substring(0, 20)}...
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-semibold transition-colors duration-300 ${
                  isActive(link.to)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300 group"
              aria-label={t('toggleTheme')}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6 text-primary-600 dark:text-accent-400 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-6 h-6 text-accent-400 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors duration-300 group"
              aria-label={t('toggleLanguage')}
            >
              <Globe className="w-6 h-6 text-primary-600 dark:text-accent-400 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-lg transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user?.firstName}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-gray-700"
                    >
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
                        onClick={() => setShowUserMenu(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="btn-outline px-4 py-2 text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/signup" className="btn-primary px-4 py-2 text-sm">
                  {t('nav.signup')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
              aria-label={t('toggleMenu')}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-primary-600" />
              ) : (
                <Menu className="w-6 h-6 text-primary-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isActive(link.to)
                        ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 px-4 pt-4 border-t border-gray-200 mt-4">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="btn-outline w-full py-3"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="btn-primary w-full py-3"
                    >
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
