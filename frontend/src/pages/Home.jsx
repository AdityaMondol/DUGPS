import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Users, Award, BookOpen, ArrowRight, Star, TrendingUp } from 'lucide-react'

const Home = () => {
  const { t } = useTranslation()

  const stats = [
    { icon: Users, value: '500+', label: t('home.students'), color: 'from-blue-500 to-cyan-500' },
    { icon: GraduationCap, value: '7+', label: t('home.teachers'), color: 'from-purple-500 to-pink-500' },
    { icon: BookOpen, value: '50+', label: t('home.yearsExperience'), color: 'from-orange-500 to-red-500' },
    { icon: Award, value: '100+', label: t('home.achievements'), color: 'from-green-500 to-emerald-500' },
  ]

  const features = [
    {
      icon: Star,
      title: t('home.qualityEducation'),
      description: t('home.qualityEducationDesc')
    },
    {
      icon: TrendingUp,
      title: t('home.excellentResults'),
      description: t('home.excellentResultsDesc')
    },
    {
      icon: Users,
      title: t('home.experiencedTeachers'),
      description: t('home.experiencedTeachersDesc')
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-accent-100/30 to-transparent dark:from-primary-900/20 dark:via-accent-900/10"></div>
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full text-sm font-semibold"
              >
                <Star className="w-4 h-4" />
                {t('home.welcome')}
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                {t('home.schoolName')}
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.tagline')}
              </p>

              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('home.description')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/about" className="btn-primary">
                  {t('home.explore')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-outline">
                  {t('contact.title')}
                </Link>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="/assets/images/Darul.jpg"
                  alt={t('home.schoolName')}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 rounded-2xl shadow-xl"
              >
                <GraduationCap className="w-12 h-12" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="card text-center group cursor-pointer"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title">{t('home.whyChooseUs')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.whyChooseUsDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="card card-hover text-center group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center text-white space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">{t('home.readyToJoin')}</h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              {t('home.readyToJoinDesc')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                {t('home.getStarted')}
              </Link>
              <Link to="/about" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300">
                {t('home.learnMore')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
