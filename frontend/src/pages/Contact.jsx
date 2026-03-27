import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Navigation, Clock, Globe, MessageSquare, Send, Camera, Star } from 'lucide-react'
import SimpleMap from '../components/Map'

const Contact = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen py-20">
      <div className="container-custom max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title">{t('contact.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">
            Visit our school or get in touch with us through the following channels
          </p>
        </motion.div>

        {/* Contact Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="card text-center group hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-8 h-8 text-white mx-auto mt-1" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('contact.address')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{t('contact.addressText')}</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=24.2437,89.9185"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>

          <div className="card text-center group hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-8 h-8 text-white mx-auto mt-1" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('contact.phone')}</h3>
            <a href="tel:01716182101" className="text-primary-600 hover:text-primary-700 font-medium block mb-2">
              01716-182101
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              School Hours: 9:00 AM - 4:00 PM
            </p>
          </div>

          <div className="card text-center group hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-8 h-8 text-white mx-auto mt-1" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('contact.email')}</h3>
            <a
              href="mailto:darululamgovtschool@gmail.com"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm break-all"
            >
              darululamgovtschool@gmail.com
            </a>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="card p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Globe className="w-6 h-6" />
                Our Location
              </h2>
              <p className="text-primary-100">
                Find us easily with this interactive map. Click on the marker for more details.
              </p>
            </div>
            <div className="p-6">
              <SimpleMap
                center={{ lat: 24.2437, lng: 89.9185 }}
                zoom={16}
                height="500px"
                className="border border-gray-200 dark:border-gray-700"
              />

              {/* Street View Panel */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  {t('contact.streetView')}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {t('contact.streetViewDescription')}
                    </p>
                    <a
                      href={`https://www.google.com/maps/@24.2437,89.9185,3a,75y,90t/data=!3m6!1e1!3m4!1s0x3755b8b7a55cd2f1:0x77f5e5b5f5b5f5b5!2e0!7i16384!8i8192`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      {t('contact.openStreetView')}
                    </a>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">{t('contact.quickDirections')}</h5>
                    <ul className="space-y-1">
                      <li>• {t('contact.fromDhaka')}: 2.5 {t('contact.hours')}</li>
                      <li>• {t('contact.fromTangailBus')}: 15 {t('contact.minutes')}</li>
                      <li>• {t('contact.fromRailway')}: 20 {t('contact.minutes')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form and Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid lg:grid-cols-5 gap-12 mb-12"
        >
          {/* Form Expanded to 3 columns */}
          <div className="lg:col-span-3 card bg-gradient-to-br from-indigo-50/50 to-pink-50/50 dark:from-indigo-900/10 dark:to-pink-900/10 border-indigo-100/50 dark:border-indigo-900/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-indigo-600/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('contact.sendMessage')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('contact.formSubtitle') || 'We normally respond within 24 hours'}</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    {t('contact.name')}
                  </label>
                  <input
                    type="text"
                    className="input-field !py-3 text-sm"
                    placeholder={t('contact.namePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    className="input-field !py-3 text-sm"
                    placeholder={t('contact.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  {t('contact.subject')}
                </label>
                <input
                  type="text"
                  className="input-field !py-3 text-sm"
                  placeholder={t('contact.subjectPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  {t('contact.message')}
                </label>
                <textarea
                  className="input-field !py-4 text-sm min-h-[160px]"
                  placeholder={t('contact.messagePlaceholder')}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary w-full h-12 text-base font-bold group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                {t('contact.submit')}
              </button>
            </form>
          </div>

          {/* School Hours/Info Expands 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card h-full flex flex-col justify-center border-slate-200/40 dark:border-slate-800/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-600/10 rounded-xl">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('contact.officeHours')}</h3>
              </div>

              <div className="space-y-4">
                {[
                  { days: t('contact.weekdays') || 'Sat - Wed', hours: '9:00 AM - 4:00 PM' },
                  { days: t('contact.thursday') || 'Thursday', hours: '9:00 AM - 1:00 PM' },
                  { days: t('contact.friday') || 'Friday', hours: t('contact.closed') || 'Closed', active: false },
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${item.active !== false ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/40 border-transparent opacity-60'}`}>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.days}</span>
                    <span className="font-medium text-xs text-slate-500 dark:text-slate-400">{item.hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  {t('contact.emergency')}
                </h4>
                <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                  {t('contact.emergencyText') || 'For urgent administrative matters during off-hours, please contact the emergency number below.'}
                </p>
                <div className="text-lg font-black tracking-wider">01716-182101</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact
