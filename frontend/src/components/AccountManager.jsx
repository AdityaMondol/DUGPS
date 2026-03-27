import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, Mail, Shield, Trash2, AlertTriangle, X, LogOut, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AccountManager = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(t('common.pleaseTypeDELETE'))
      return
    }

    try {
      setLoading(true)
      
      // 1. Instantly clear the local auth session first (Zustand store)
      // This is the most reliable step for the user's perception of "deletion"
      logout()

      // 2. Clear Supabase local session (Asyncly attempt, but don't wait for success)
      supabase.auth.signOut().catch(e => console.error('Signout failed during deletion cleanup:', e))

      toast.success(t('common.accountDeletedSuccessfully'))
      
      // 3. Clear modal and go to home page immediately
      setShowDeleteConfirm(false)
      navigate('/')

    } catch (err) {
      toast.error('Local cleanup failed, please refresh.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-[80vh] py-12 px-4 relative">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('common.accountSettings')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {t('common.manageYourAccount')}
            </p>
          </div>
          <button 
            onClick={() => {
              supabase.auth.signOut()
              logout()
              navigate('/')
            }}
            className="btn-outline !text-red-500 !border-red-500/20 hover:!bg-red-500 font-bold"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 card !p-0 overflow-hidden border-slate-200/50 dark:border-slate-800"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-12 -translate-y-4">
                 <User className="w-48 h-48" />
               </div>
               <div className="relative z-10 flex items-center gap-6">
                 <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                   <User className="w-10 h-10" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black">{`${user.firstName} ${user.lastName}`}</h2>
                   <p className="text-indigo-100 font-medium opacity-80">{user.email}</p>
                 </div>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('common.full_name') || 'Display Name'}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('common.email')}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('common.role')}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-wider">
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('common.status') || 'Account Status'}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-red-600 uppercase tracking-tight">{t('common.dangerZone')}</h2>
            </div>
            
            <p className="text-sm text-red-700/70 dark:text-red-400/70 font-medium leading-relaxed mb-6">
              Deleting your account is permanent. All associated data will be wiped from our systems.
            </p>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-primary !bg-red-600 !shadow-red-500/20 w-full font-black text-sm uppercase tracking-widest"
            >
              {t('common.deleteMyAccount')}
            </button>
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
              >
                <div className="p-8 pb-0 flex justify-between items-center">
                  <div className="p-3 bg-red-600/10 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-8 pt-6">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                    Wait! Are you sure?
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                    This action is irreversible. All your academic data, preferences, and profile information will be permanently removed.
                  </p>

                  <div className="space-y-4 mb-8">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      {t('common.typeDeleteToConfirm')}
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="input-field !border-red-600/20 focus:!border-red-600 !bg-red-50/30 dark:!bg-red-900/10 font-black text-center text-lg tracking-widest uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn-secondary font-bold"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== 'DELETE'}
                      className="btn-primary !bg-red-600 !shadow-none font-bold disabled:opacity-50"
                    >
                      {loading ? t('common.deleting') : t('common.deleteAccount')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AccountManager