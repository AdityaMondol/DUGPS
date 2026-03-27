import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Settings, Trash2, Plus, Search, Filter, X, ChevronRight, Calendar, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NoticeManager = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    search: ''
  })

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'announcement',
    priority: 'medium',
    tags: '',
    expiry_date: ''
  })

  const categories = [
    { value: 'academic', label: t('common.academic') },
    { value: 'administrative', label: t('common.administrative') },
    { value: 'event', label: t('common.event') },
    { value: 'announcement', label: t('common.announcement') }
  ]

  const priorities = [
    { value: 'low', label: t('common.low'), color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: t('common.medium'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: t('common.high'), color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: t('common.urgent'), color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    fetchNotices()
  }, [filters])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      let query = supabase.from('notices').select('*')
      
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.priority) query = query.eq('priority', filters.priority)
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      setNotices(data || [])
    } catch (err) {
      console.error('Fetch notices error:', err.message)
      setError(t('common.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      const submitData = {
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        priority: noticeForm.priority,
        tags: noticeForm.tags ? noticeForm.tags.split(',').map(tag => tag.trim()) : [],
        expiry_date: noticeForm.expiry_date || null,
        author_id: user.id,
        author_name: `${user.firstName} ${user.lastName}`
      }
      
      const { error: insertError } = await supabase.from('notices').insert([submitData])

      if (insertError) throw insertError

      setSuccess(t('common.noticeCreatedSuccessfully'))
      setNoticeForm({
        title: '',
        content: '',
        category: 'announcement',
        priority: 'medium',
        tags: '',
        expiry_date: ''
      })
      setShowCreateForm(false)
      fetchNotices()
    } catch (err) {
      console.error('Create notice error:', err.message)
      setError(err.message || t('common.createFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (noticeId, updates) => {
    try {
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(tag => tag.trim())
      }

      const { error: updateError } = await supabase
        .from('notices')
        .update(updates)
        .eq('id', noticeId)

      if (updateError) throw updateError

      setSuccess(t('common.noticeUpdatedSuccessfully'))
      setEditingNotice(null)
      fetchNotices()
    } catch (err) {
      console.error('Update notice error:', err.message)
      setError(err.message || t('common.updateFailed'))
    }
  }

  const handleDelete = async (noticeId) => {
    if (!confirm(t('common.confirmDeleteNotice'))) return

    try {
      const { error: deleteError } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId)

      if (deleteError) throw deleteError

      setSuccess(t('common.noticeDeletedSuccessfully'))
      fetchNotices()
    } catch (err) {
      console.error('Delete notice error:', err.message)
      setError(err.message || t('common.deleteFailed'))
    }
  }

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority)
    return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t('common.loginRequired')}
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4">
            {t('notice.title')}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {t('notice.subtitle')}
          </p>
          {user.role === 'teacher' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              {t('common.createNotice')}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {success}
          </div>
        )}

        <div className="glass-effect p-6 rounded-3xl mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                {t('common.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="input-field"
              >
                <option value="">{t('common.allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                {t('common.priority')}
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="input-field"
              >
                <option value="">{t('common.allPriorities')}</option>
                {priorities.map(pri => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                {t('common.search')}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder={t('common.searchNotices')}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', priority: '', search: '' })}
                className="btn-secondary w-full"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && user.role === 'teacher' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{t('common.createNewNotice')}</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.title')}
                    </label>
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.category')}
                    </label>
                    <select
                      value={noticeForm.category}
                      onChange={(e) => setNoticeForm({...noticeForm, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.priority')}
                    </label>
                    <select
                      value={noticeForm.priority}
                      onChange={(e) => setNoticeForm({...noticeForm, priority: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorities.map(pri => (
                        <option key={pri.value} value={pri.value}>{pri.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.expiryDate')} ({t('common.optional')})
                    </label>
                    <input
                      type="date"
                      value={noticeForm.expiry_date}
                      onChange={(e) => setNoticeForm({...noticeForm, expiry_date: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.content')}
                  </label>
                  <textarea
                    value={noticeForm.content}
                    onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})}
                    required
                    rows="6"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.tags')} ({t('common.optional')})
                  </label>
                  <input
                    type="text"
                    value={noticeForm.tags}
                    onChange={(e) => setNoticeForm({...noticeForm, tags: e.target.value})}
                    placeholder={t('common.tagsSeparatedByCommas')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? t('common.creating') : t('common.createNotice')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">{t('common.noNoticesFound')}</div>
            </div>
          ) : (
            notices.map((notice) => (
              <motion.div 
                key={notice.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card !p-8 ${isExpired(notice.expiry_date) ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{notice.title}</h3>
                      {isExpired(notice.expiry_date) && (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md border border-red-200/50 dark:border-red-800/50">
                          {t('common.expired')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        notice.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                        notice.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
                        'bg-blue-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
                      }`}>
                        {priorities.find(p => p.value === notice.priority)?.label}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700">
                        {categories.find(c => c.value === notice.category)?.label}
                      </span>
                      {notice.tags && notice.tags.length > 0 && notice.tags.map((tag, index) => (
                        <span key={index} className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {notice.author_id === user.id && user.role === 'teacher' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNotice(notice)}
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{notice.content}</p>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-6 mt-auto border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-600">
                      {notice.author_name?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{notice.author_name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('common.author')}</div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none mb-1">{formatDate(notice.created_at)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('common.published')}</div>
                    </div>
                    {notice.expiry_date && (
                      <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none mb-1">{formatDate(notice.expiry_date)}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('common.expires')}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {editingNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{t('common.editNotice')}</h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updates = {
                  title: formData.get('title'),
                  content: formData.get('content'),
                  category: formData.get('category'),
                  priority: formData.get('priority'),
                  tags: formData.get('tags'),
                  expiry_date: formData.get('expiry_date') || null
                }
                handleEdit(editingNotice.id, updates)
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.title')}
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingNotice.title}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.category')}
                    </label>
                    <select
                      name="category"
                      defaultValue={editingNotice.category}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.priority')}
                    </label>
                    <select
                      name="priority"
                      defaultValue={editingNotice.priority}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorities.map(pri => (
                        <option key={pri.value} value={pri.value}>{pri.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('common.expiryDate')} ({t('common.optional')})
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      defaultValue={editingNotice.expiry_date ? editingNotice.expiry_date.split('T')[0] : ''}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.content')}
                  </label>
                  <textarea
                    name="content"
                    defaultValue={editingNotice.content}
                    required
                    rows="6"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.tags')} ({t('common.optional')})
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingNotice.tags?.join(', ')}
                    placeholder={t('common.tagsSeparatedByCommas')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                  >
                    {t('common.updateNotice')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingNotice(null)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NoticeManager