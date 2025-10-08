import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { User, Mail, Shield, Settings } from 'lucide-react'
import AccountManager from '../components/AccountManager'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [showAccountManager, setShowAccountManager] = useState(false)

  if (showAccountManager) {
    return <AccountManager />
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">{t('dashboard.title')}</h1>
          
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('dashboard.welcome')}, {user?.firstName}!
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <User className="w-5 h-5 text-primary-600" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Mail className="w-5 h-5 text-primary-600" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('common.quickActions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowAccountManager(true)}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('common.accountSettings')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.manageYourAccount')}
                  </div>
                </div>
              </button>
              
              {user?.role === 'teacher' && (
                <>
                  <a href="/media" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="w-5 h-5 text-green-600">📸</div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('common.mediaManagement')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('common.uploadAndManageMedia')}
                      </div>
                    </div>
                  </a>
                  
                  <a href="/notice" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="w-5 h-5 text-purple-600">📢</div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('common.noticeBoard')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('common.createAndManageNotices')}
                      </div>
                    </div>
                  </a>
                </>
              )}
              
              <a href="/media" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="w-5 h-5 text-orange-600">🖼️</div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('common.viewMedia')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.browsePicturesAndVideos')}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard