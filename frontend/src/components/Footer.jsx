import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { GraduationCap, MapPin, Phone, Mail, Facebook, Youtube, Twitter, Heart } from 'lucide-react'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">{t('home.schoolName').substring(0, 15)}...</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('home.description').substring(0, 120)}...
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-black mb-4 border-b-2 border-accent-500 pb-2 inline-block uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {['home', 'about', 'teachers', 'notice'].map((link) => (
                <li key={link}>
                  <Link
                    to={link === 'home' ? '/' : `/${link}`}
                    className="text-gray-300 hover:text-accent-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-4 transition-all duration-300 h-0.5 bg-accent-400"></span>
                    {t(`nav.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-black mb-4 border-b-2 border-accent-500 pb-2 inline-block uppercase tracking-wider">
              {t('contact.title')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <span>{t('contact.addressText')}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone className="w-5 h-5 text-accent-400 flex-shrink-0" />
                <a href="tel:01716182101" className="hover:text-accent-400 transition-colors">
                  01716-182101
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail className="w-5 h-5 text-accent-400 flex-shrink-0" />
                <a
                  href="mailto:darululamgovtschool@gmail.com"
                  className="hover:text-accent-400 transition-colors break-all"
                >
                  darululamgovtschool@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-base font-black mb-4 border-b-2 border-accent-500 pb-2 inline-block uppercase tracking-wider">
              Follow Us
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Stay connected with us on social media
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
                { icon: Youtube, href: '#', color: 'hover:bg-red-600' },
                { icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
              ].map(({ icon: Icon, href, color }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white/10 p-3 rounded-lg ${color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                  aria-label={`Social media link ${index + 1}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm flex items-center gap-2">
            © {currentYear} {t('footer.allRightsReserved')}. {t('footer.copyright')}
          </p>
          <p className="text-gray-300 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 animate-pulse" /> in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
