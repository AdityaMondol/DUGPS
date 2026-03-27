import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'

const Feedback = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [feedbackText, setFeedbackText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackText.trim()) return
    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('feedbacks')
        .insert([
          { 
            content: feedbackText,
            author_id: user?.id || null,
            author_email: user?.email || 'Anonymous'
          }
        ])

      if (insertError) throw insertError

      setFeedbackText('')
      toast.success(t('common.success'))
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-32 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wider uppercase border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
             <MessageSquare className="w-4 h-4" />
             {t('feedback.title')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {t('feedback.title')}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            {t('feedback.subtitle')}
          </p>
        </motion.div>
 
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="card !p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
               <label className="text-base font-bold text-slate-900 dark:text-white ml-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  {t('feedback.feedbackText')}
               </label>
               <textarea 
                  value={feedbackText} 
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="input-field min-h-[160px] text-base !rounded-3xl p-6" 
                  placeholder={t('feedback.feedbackText')} 
                  required 
               />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full h-14 text-lg font-bold group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {t('feedback.submit')}
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        <div className="mt-12 text-center">
           <p className="text-slate-400 text-sm font-medium">
             Your feedback helps us provide a better education for everyone.
           </p>
        </div>
      </div>
    </div>
  )
}

export default Feedback
