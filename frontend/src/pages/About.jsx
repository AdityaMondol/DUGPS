import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Target, Eye, Heart, Award } from 'lucide-react'

const About = () => {
  const { t } = useTranslation()

  const values = [
    { icon: Target, title: t('about.mission'), description: t('about.missionText') },
    { icon: Eye, title: t('about.vision'), description: t('about.visionText') },
    { icon: Heart, title: t('about.values'), description: t('about.valuesText') },
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">{t('about.title')}</h1>
          <p className="text-base text-gray-600 dark:text-gray-400 font-semibold mb-4">
            {t('about.subtitle')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            {t('about.description')}
          </p>
        </motion.div>

        {/* School Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video">
            <img
              src="/assets/images/Darul.jpg"
              alt={t('home.schoolName')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-1">{t('home.schoolName')}</h3>
                <p className="text-base opacity-90">{t('home.tagline')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="card card-hover group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-6 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievement Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('about.ourLegacy')}
            </h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('about.legacyText')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default About
