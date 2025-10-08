import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import useAuthStore from '../store/authStore'

const Feedback = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackText, setFeedbackText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackText.trim()) return
    setLoading(true)
    try {
      const response = await api.post('/feedbacks', { content: feedbackText })
      setFeedbacks([response.data, ...feedbacks])
      setFeedbackText('')
      toast.success(t('common.success'))
    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title">{t('feedback.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t('feedback.subtitle')}</p>
        </motion.div>

        <div className="card mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
              className="input-field min-h-[120px]" placeholder={t('feedback.feedbackText')} required />
            <button type="submit" disabled={loading} className="btn-primary">
              <Send className="w-5 h-5" />{t('feedback.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Feedback
