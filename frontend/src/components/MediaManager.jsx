import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { File, Image, Video, Music, FileText } from 'lucide-react'

const MediaManager = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
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
      let query = supabase.from('media').select('*')
      
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      setMedia(data || [])
    } catch (err) {
      console.error('Fetch media error:', err.message)
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

    try {
      setLoading(true)
      
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}_${uploadForm.file.name.replace(/\s/g, '_')}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, uploadForm.file)

      if (storageError) throw storageError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      // 3. Save metadata to Database
      const submitData = {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : [],
        file_path: fileName,
        file_url: publicUrl,
        file_size: uploadForm.file.size,
        mime_type: uploadForm.file.type,
        author_id: user.id,
        author_name: `${user.firstName} ${user.lastName}`
      }

      const { error: insertError } = await supabase.from('media').insert([submitData])

      if (insertError) throw insertError

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
    } catch (err) {
      console.error('Media upload error:', err.message)
      setError(err.message || t('common.uploadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (mediaId, updates) => {
    try {
      if (updates.tags && typeof updates.tags === 'string') {
        updates.tags = updates.tags.split(',').map(tag => tag.trim())
      }

      const { error: updateError } = await supabase
        .from('media')
        .update(updates)
        .eq('id', mediaId)

      if (updateError) throw updateError

      setSuccess(t('common.mediaUpdatedSuccessfully'))
      setEditingMedia(null)
      fetchMedia()
    } catch (err) {
      console.error('Update media error:', err.message)
      setError(err.message || t('common.updateFailed'))
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(t('common.confirmDeleteMedia'))) return

    try {
      // 1. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([item.file_path])

      if (storageError) throw storageError

      // 2. Delete from Database
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError

      setSuccess(t('common.mediaDeletedSuccessfully'))
      fetchMedia()
    } catch (err) {
      console.error('Delete media error:', err.message)
      setError(err.message || t('common.deleteFailed'))
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8 text-green-500" />
    return <FileText className="w-8 h-8 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t('common.bytes')}`
    const k = 1024
    const sizes = [t('common.bytes'), t('common.kb'), t('common.mb'), t('common.gb')]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <h1 className="section-title !mb-2">{t('common.mediaManagement')}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('media.subtitle') || 'Explore our school gallery and resources'}</p>
          </div>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn-primary group"
            >
              <div className="w-5 h-5 mr-1 group-hover:rotate-12 transition-transform">
                <File className="w-5 h-5" />
              </div>
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

        <div className="card !p-4 mb-10 border-slate-200/40 dark:border-slate-800/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                {t('common.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="input-field !py-2.5 text-sm"
              >
                <option value="">{t('common.allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                {t('common.search')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder={t('common.searchMedia')}
                  className="input-field !py-2.5 !pl-4 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ category: '', search: '' })}
                className="btn-secondary h-[42px] px-6 text-sm w-full md:w-auto"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20 card border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <div className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t('common.loading')}</div>
              </div>
            </div>
          ) : media.length === 0 ? (
            <div className="col-span-full text-center py-20 card border-dashed">
              <div className="text-slate-500 dark:text-slate-400 font-medium">{t('common.noMediaFound')}</div>
            </div>
          ) : (
            media.map((item) => (
              <div key={item.id} className="card group flex flex-col hover:border-indigo-500/50 transition-all duration-500">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
                  {item.category === 'image' ? (
                    <img 
                      src={item.file_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-40">
                      {getFileIcon(item.mime_type)}
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md">
                      {t(`common.${item.category}`)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {item.tags && item.tags.map((tag, index) => (
                      <span key={index} className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{item.author_name}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('common.author')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{new Date(item.created_at).toLocaleDateString()}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('common.uploaded')}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary !h-10 !text-xs w-full"
                    >
                      {item.mime_type.startsWith('image/') ? t('common.viewImage') : 
                       item.mime_type.startsWith('video/') ? t('common.viewVideo') : 
                       item.mime_type.startsWith('audio/') ? t('common.playAudio') : t('common.downloadFile')}
                    </a>
                    
                    {user && item.author_id === user.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingMedia(item)}
                          className="btn-secondary !h-10 !text-xs flex-1 !p-0"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn-secondary !h-10 !text-xs !bg-red-50 !text-red-600 !border-red-100 flex-1 hover:!bg-red-100 transition-colors !p-0"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    )}
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