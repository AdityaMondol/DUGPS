import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { User, Mail, Shield, Settings } from 'lucide-react'
import AccountManager from '../components/AccountManager'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showAccountManager, setShowAccountManager] = useState(false)

  if (showAccountManager) {
    return (
      <div className="min-h-screen py-20">
        <div className="container-custom max-w-4xl">
          <button 
            onClick={() => setShowAccountManager(false)}
            className="mb-8 text-indigo-600 font-bold hover:underline flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <AccountManager />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">{t('dashboard.title')}</h1>
          
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t('dashboard.welcome')}, {user?.firstName}!
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-3">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Name</div>
                <div className="font-bold text-slate-900 dark:text-white truncate max-w-full">{user?.firstName} {user?.lastName}</div>
              </div>

              <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-3">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                <div className="font-bold text-slate-900 dark:text-white truncate max-w-full">{user?.email}</div>
              </div>

              <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-3">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role</div>
                <div className="font-bold text-slate-900 dark:text-white capitalize">{user?.role}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              {t('common.quickActions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setShowAccountManager(true)}
                className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-xl transition-all group"
              >
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">
                    {t('common.accountSettings')}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('common.manageYourAccount')}
                  </div>
                </div>
              </button>
              
              {user?.role === 'teacher' && (
                <>
                  <Link 
                    to="/media" 
                    className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-xl transition-all group"
                  >
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <div className="text-emerald-600 font-bold">Media</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white text-lg">
                        {t('common.mediaManagement')}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('common.uploadAndManageMedia')}
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/notice" 
                    className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-purple-500/30 hover:shadow-xl transition-all group"
                  >
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <div className="text-purple-600 font-bold">Notice</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white text-lg">
                        {t('common.noticeBoard')}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t('common.createAndManageNotices')}
                      </div>
                    </div>
                  </Link>
                </>
              )}
              
              <Link 
                to="/media" 
                className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-orange-500/30 hover:shadow-xl transition-all group"
              >
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <div className="text-orange-600 font-bold">Gallery</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 dark:text-white text-lg">
                    {t('common.viewMedia')}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('common.browsePicturesAndVideos')}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard