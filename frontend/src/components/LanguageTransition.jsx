import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

const LanguageTransition = () => {
  const { i18n } = useTranslation()
  const [isChanging, setIsChanging] = useState(false)
  const [displayLang, setDisplayLang] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setIsChanging(true)
      setTimeout(() => {
        setDisplayLang(lng)
        setIsChanging(false)
      }, 600)
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => i18n.off('languageChanged', handleLanguageChange)
  }, [i18n])

  return (
    <AnimatePresence mode="wait">
      {isChanging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-600 dark:bg-slate-900 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="text-center"
          >
            <div className="text-6xl font-black text-white mb-4">
              {i18n.language === 'bn' ? 'বাংলা' : 'English'}
            </div>
            <div className="h-1 w-24 bg-white/30 mx-auto rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-full w-full bg-white"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LanguageTransition
