import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Mail, Phone, Award } from 'lucide-react'

const Teachers = () => {
  const { t } = useTranslation()

  const headTeacher = {
    name: 'আসরিন সিদ্দিকী',
    nameEn: 'Asrin Siddiqui',
    designation: t('teachers.headTeacher'),
    qualification: 'এম.এ, বি.এড',
    phone: '+৮৮০-১৭১২-৩৪৫৬৭৮',
    image: '/assets/images/teacher1.jpg',
  }

  const assistantTeachers = [
    { name: 'মুনমুন আক্তার', nameEn: 'Munmun Akter', qualification: 'বি.এ, বি.এড', image: '/assets/images/Teacher2.jpg' },
    { name: 'ইনারা বেগম', nameEn: 'Inara Begum', qualification: 'বি.এ, বি.এড', image: '/assets/images/teacher3.jpg' },
    { name: 'সালমা আক্তার', nameEn: 'Salma Akter', qualification: 'বি.এ, বি.এড', image: '/assets/images/All.jpg' },
    { name: 'শিল্পী রানী কর্মকার', nameEn: 'Shilpi Rani Karmakar', qualification: 'বি.এ, বি.এড', image: '/assets/images/shilpi.jpg' },
    { name: 'রাশেদা আনসারী', nameEn: 'Rasheda Ansari', qualification: 'বি.এ, বি.এড', image: '/assets/images/and.jpg' },
    { name: 'আসমা আক্তার', nameEn: 'Asma Akter', qualification: 'বি.এ, বি.এড', image: '/assets/images/two.jpg' },
    { name: 'সুমাইয়া নূর মিসৌরি', nameEn: 'Sumaiya Nur Misouri', qualification: 'বি.এ, বি.এড', image: '/assets/images/Misury.jpg' },
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
          <h1 className="section-title">{t('teachers.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('teachers.subtitle')}
          </p>
        </motion.div>

        {/* Head Teacher Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <Award className="w-8 h-8 text-primary-600" />
            {t('teachers.headTeacher')}
          </h2>
          
          <div className="card max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[300px,1fr] gap-8 items-center">
              <div className="relative group">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={headTeacher.image}
                    alt={headTeacher.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {headTeacher.name}
                  </h3>
                  <p className="text-lg text-primary-600 dark:text-accent-400 font-semibold mb-2">
                    {headTeacher.designation}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Award className="w-5 h-5" />
                    <span>{headTeacher.qualification}</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-5 h-5 text-primary-600" />
                    <a href={`tel:${headTeacher.phone}`} className="hover:text-primary-600 transition-colors">
                      {headTeacher.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Assistant Teachers */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <Award className="w-8 h-8 text-accent-600" />
            {t('teachers.assistantTeacher')}
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assistantTeachers.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover group"
              >
                <div className="relative mb-4">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-600/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-accent-600 dark:text-accent-400 font-semibold">
                    {t('teachers.assistantTeacher')}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <Award className="w-4 h-4" />
                    <span>{teacher.qualification}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Teachers
