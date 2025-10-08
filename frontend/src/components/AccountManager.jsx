import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AccountManager = () => {
  const { t } = useTranslation()
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError(t('common.pleaseTypeDELETE'))
      return
    }

    try {
      setLoading(true)
      console.log('🗑️ Attempting to delete account...')
      
      const response = await api.delete('/auth/delete-account')
      
      console.log('✅ Account deletion successful')
      setSuccess(t('common.accountDeletedSuccessfully'))
      setTimeout(() => {
        logout()
        navigate('/')
      }, 2000)
    } catch (err) {
      console.error('❌ Account deletion failed:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(t('common.networkError'))
      }
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('common.accountManagement')}</h1>

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('common.accountInformation')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t('common.name')}:</span>
              <span className="text-gray-600">{`${user.firstName} ${user.lastName}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t('common.email')}:</span>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">{t('common.role')}:</span>
              <span className="text-gray-600 capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-600 mb-4">{t('common.dangerZone')}</h2>
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <h3 className="font-bold text-red-800 mb-2">{t('common.deleteAccount')}</h3>
            <p className="text-red-700 text-sm mb-4">
              {t('common.deleteAccountWarning')}
            </p>
            <ul className="text-red-700 text-sm mb-4 list-disc list-inside space-y-1">
              <li>{t('common.deleteAccountConsequence1')}</li>
              <li>{t('common.deleteAccountConsequence2')}</li>
              <li>{t('common.deleteAccountConsequence3')}</li>
              <li>{t('common.deleteAccountConsequence4')}</li>
            </ul>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              {t('common.deleteMyAccount')}
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-red-600 mb-4">{t('common.confirmDeleteAccount')}</h2>
              
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-700 text-sm mb-3">
                  {t('common.deleteAccountFinalWarning')}
                </p>
                <p className="text-red-700 text-sm font-medium mb-3">
                  {t('common.thisActionCannotBeUndone')}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.typeDeleteToConfirm')}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('common.typeDELETEExactly')}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteConfirmText !== 'DELETE'}
                  className="flex-1 bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.deleting') : t('common.deleteAccount')}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                    setError('')
                  }}
                  className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountManager