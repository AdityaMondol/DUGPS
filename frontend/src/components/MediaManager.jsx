import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import api from '../utils/api'

const MediaManager = () => {
  const { t } = useTranslation()
  const { user, token } = useAuth()
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingMedia, setEditingMedia] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  })

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'image',
    tags: '',
    file: null
  })

  const categories = [
    { value: 'image', label: t('common.image') },
    { value: 'video', label: t('common.video') },
    { value: 'audio', label: t('common.audio') },
    { value: 'document', label: t('common.document') }
  ]

  useEffect(() => {
    fetchMedia()
  }, [filters])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      
      const response = await api.get(`/media?${params}`)
      
      if (response.status === 200) {
        const data = response.data
        let filteredMedia = data.media || []
        
        if (filters.search) {
          filteredMedia = filteredMedia.filter(item => 
            item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.description.toLowerCase().includes(filters.search.toLowerCase())
          )
        }
        
        setMedia(filteredMedia)
      } else {
        setError(t('common.errorFetchingMedia'))
      }
    } catch (err) {
      console.error('Get media error:', err)
      setError(t('common.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!uploadForm.file) {
      setError(t('common.pleaseSelectFile'))
      return
    }

    const formData = new FormData()
    formData.append('file', uploadForm.file)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('category', uploadForm.category)
    formData.append('tags', uploadForm.tags)

    try {
      setLoading(true)
      const response = await api.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 201) {
        setSuccess(t('common.mediaUploadedSuccessfully'))
        setUploadForm({
          title: '',
          description: '',
          category: 'image',
          tags: '',
          file: null
        })
        setShowUploadForm(false)
        fetchMedia()
      } else {
        setError(response.data?.message || t('common.uploadFailed'))
      }
    } catch (err) {
      console.error('Media upload error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (mediaId, updates) => {
    try {
      const response = await api.put(`/media/${mediaId}`, updates)

      if (response.status === 200) {
        setSuccess(t('common.mediaUpdatedSuccessfully'))
        setEditingMedia(null)
        fetchMedia()
      } else {
        setError(response.data?.message || t('common.updateFailed'))
      }
    } catch (err) {
      console.error('Update media error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    }
  }

  const handleDelete = async (mediaId) => {
    if (!confirm(t('common.confirmDeleteMedia'))) return

    try {
      const response = await api.delete(`/media/${mediaId}`)

      if (response.status === 200) {
        setSuccess(t('common.mediaDeletedSuccessfully'))
        fetchMedia()
      } else {
        setError(response.data?.message || t('common.deleteFailed'))
      }
    } catch (err) {
      console.error('Delete media error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    return '📄'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t('common.bytes')}`
    const k = 1024
    const sizes = [t('common.bytes'), t('common.kb'), t('common.mb'), t('common.gb')]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('common.mediaManagement')}</h1>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.uploadMedia')}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {t('common.search')}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder={t('common.searchMedia')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', search: '' })}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {showUploadForm && user?.role === 'teacher' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">{t('common.uploadNewMedia')}</h2>
              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.title')}
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.description')}
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    required
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.category')}
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.tags')}
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder={t('common.tagsSeparatedByCommas')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.file')}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    required
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? t('common.uploading') : t('common.upload')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : media.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">{t('common.noMediaFound')}</div>
            </div>
          ) : (
            media.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getFileIcon(item.mime_type)}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags && item.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>{t('common.size')}: {formatFileSize(item.file_size)}</div>
                    <div>{t('common.uploaded')}: {new Date(item.created_at).toLocaleDateString()}</div>
                    <div>{t('common.author')}: {item.author_name}</div>
                  </div>
                  
                  {user && item.author_id === user.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMedia(item)}
                        className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/media/${item.file_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors inline-block text-center"
                    >
                      {item.mime_type.startsWith('image/') ? t('common.viewImage') : 
                       item.mime_type.startsWith('video/') ? t('common.viewVideo') : 
                       item.mime_type.startsWith('audio/') ? t('common.playAudio') : t('common.downloadFile')}
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {editingMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">{t('common.editMedia')}</h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updates = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  tags: formData.get('tags')
                }
                handleEdit(editingMedia.id, updates)
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.title')}
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingMedia.title}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.description')}
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingMedia.description}
                    required
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.category')}
                  </label>
                  <select
                    name="category"
                    defaultValue={editingMedia.category}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.tags')}
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingMedia.tags?.join(', ')}
                    placeholder={t('common.tagsSeparatedByCommas')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                  >
                    {t('common.updateMedia')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
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

export default MediaManager