import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GraduationCap, Users, Award, BookOpen, ArrowRight, Star, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react'
import { useRef } from 'react'

const Home = () => {
  const { t } = useTranslation()
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50])

  const stats = [
    { icon: Users, value: '500+', label: t('home.students'), color: 'from-blue-500 to-indigo-600' },
    { icon: GraduationCap, value: '7+', label: t('home.teachers'), color: 'from-indigo-600 to-purple-600' },
    { icon: BookOpen, value: '50+', label: t('home.yearsExperience'), color: 'from-purple-600 to-pink-600' },
    { icon: Award, value: '100+', label: t('home.achievements'), color: 'from-pink-600 to-rose-600' },
  ]

  const features = [
    {
      icon: Star,
      title: t('home.qualityEducation'),
      description: t('home.qualityEducationDesc'),
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      iconColor: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: t('home.excellentResults'),
      description: t('home.excellentResultsDesc'),
      bg: 'bg-indigo-50 dark:bg-indigo-900/10',
      iconColor: 'text-indigo-600'
    },
    {
      icon: ShieldCheck,
      title: t('home.experiencedTeachers'),
      description: t('home.experiencedTeachersDesc'),
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      iconColor: 'text-emerald-600'
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Hero Section */}
      <section ref={targetRef} className="relative pt-32 pb-24 lg:pt-48 lg:pb-40">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="mesh-gradient absolute inset-0 opacity-20" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-white dark:via-slate-950/50 dark:to-slate-950" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              style={{ opacity, scale, y }}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl space-y-10"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wider uppercase border border-indigo-100 dark:border-indigo-900/50 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  {t('home.welcome')}
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white">
                  {t('home.schoolName')}
                </h1>

                <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  {t('home.tagline')}
                </p>
              </div>

              <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                {t('home.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/about" className="btn-primary group h-12 px-8 text-base">
                  {t('home.explore')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="btn-secondary h-12 px-8 text-base">
                  {t('contact.title')}
                </Link>
              </div>
            </motion.div>

            {/* Visual Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="relative"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-70" />
                <div className="relative aspect-[4/5] md:aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.3)] border-8 border-white/50 backdrop-blur-sm dark:border-slate-800/50">
                  <img
                    src="/assets/images/Darul.jpg"
                    alt={t('home.schoolName')}
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-slate-100 dark:border-slate-800"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20 space-y-6"
          >
            <h2 className="section-title !mb-0">{t('home.whyChooseUs')}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t('home.whyChooseUsDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5"
              >
                <div className={`w-16 h-16 rounded-[1.25rem] ${feature.bg} flex items-center justify-center mb-8 border border-slate-100/50 dark:border-white/5`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-20 rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-[50%] -left-[20%] w-[100%] h-[200%] bg-indigo-500/10 blur-[120px] rounded-full rotate-45" />
              <div className="absolute -bottom-[50%] -right-[20%] w-[100%] h-[200%] bg-pink-500/10 blur-[120px] rounded-full -rotate-45" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none">
                    {t('home.readyToJoin')}
                  </h2>
                  <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                    {t('home.readyToJoinDesc')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-5">
                  <Link to="/signup" className="h-12 px-10 rounded-2xl bg-white text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all text-base flex items-center shadow-xl">
                    {t('home.getStarted')}
                  </Link>
                  <Link to="/about" className="h-12 px-10 rounded-2xl border-2 border-white/20 text-white font-bold hover:bg-white/10 transition-all text-base flex items-center">
                    {t('home.learnMore')}
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex justify-end">
                <div className="relative w-80 h-80">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-2 border-dashed border-white/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="w-32 h-32 text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

