import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import api from '../utils/api'

const NoticeManager = () => {
  const { t } = useTranslation()
  const { user, token } = useAuth()
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
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.priority) params.append('priority', filters.priority)
      
      const response = await api.get(`/notices?${params}`)
      
      if (response.status === 200) {
        const data = response.data
        let filteredNotices = data.notices || []
        
        console.log('📄 Retrieved notices:', filteredNotices.length)
        console.log('📝 First notice sample:', filteredNotices[0])
        
        if (filters.search) {
          filteredNotices = filteredNotices.filter(notice => 
            notice.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            notice.content.toLowerCase().includes(filters.search.toLowerCase())
          )
        }
        
        setNotices(filteredNotices)
      } else {
        setError(t('common.errorFetchingNotices'))
      }
    } catch (err) {
      setError(t('common.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      console.log('📃 Creating notice with form data:', noticeForm)
      
      // Prepare the data, making tags and expiry_date truly optional
      const submitData = {
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        priority: noticeForm.priority,
        tags: noticeForm.tags.trim() || undefined,
        expiry_date: noticeForm.expiry_date.trim() || undefined
      }
      
      // Remove undefined fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key]
        }
      })
      
      console.log('📤 Submitting processed data:', submitData)
      
      const response = await api.post('/notices', submitData)

      if (response.status === 201) {
        console.log('✅ Notice created successfully:', response.data)
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
      } else {
        console.error('❌ Notice creation failed:', response.data)
        setError(response.data?.message || t('common.createFailed'))
      }
    } catch (err) {
      console.error('❌ Create notice error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (noticeId, updates) => {
    try {
      const response = await api.put(`/notices/${noticeId}`, updates)

      if (response.status === 200) {
        setSuccess(t('common.noticeUpdatedSuccessfully'))
        setEditingNotice(null)
        fetchNotices()
      } else {
        setError(response.data?.message || t('common.updateFailed'))
      }
    } catch (err) {
      console.error('Update notice error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    }
  }

  const handleDelete = async (noticeId) => {
    if (!confirm(t('common.confirmDeleteNotice'))) return

    try {
      const response = await api.delete(`/notices/${noticeId}`)

      if (response.status === 200) {
        setSuccess(t('common.noticeDeletedSuccessfully'))
        fetchNotices()
      } else {
        setError(response.data?.message || t('common.deleteFailed'))
      }
    } catch (err) {
      console.error('Delete notice error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('common.noticeBoard')}</h1>
          {user.role === 'teacher' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.createNotice')}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('common.allCategories')}</option>
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
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('common.allPriorities')}</option>
                {priorities.map(pri => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.search')}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder={t('common.searchNotices')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', priority: '', search: '' })}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
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
              <div key={notice.id} className={`bg-white rounded-lg shadow-md p-6 ${isExpired(notice.expiry_date) ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{notice.title}</h3>
                      {isExpired(notice.expiry_date) && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {t('common.expired')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(notice.priority)}`}>
                        {priorities.find(p => p.value === notice.priority)?.label}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {categories.find(c => c.value === notice.category)?.label}
                      </span>
                      {notice.tags && notice.tags.length > 0 && notice.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {notice.author_id === user.id && user.role === 'teacher' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNotice(notice)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                </div>

                <div className="text-sm text-gray-500 border-t pt-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="font-medium">{t('common.author')}:</span> {notice.author_name}
                    </div>
                    <div>
                      <span className="font-medium">{t('common.published')}:</span> {formatDate(notice.created_at)}
                    </div>
                    {notice.expiry_date && (
                      <div>
                        <span className="font-medium">{t('common.expires')}:</span> {formatDate(notice.expiry_date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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