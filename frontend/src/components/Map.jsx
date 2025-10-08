import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBHLett8djBo62dDXj0EjCpF8vmuc23pLo'

// School coordinates (Tangail, Bangladesh)
const SCHOOL_LOCATION = {
  lat: 24.2437,
  lng: 89.9185
}

// Simple Static Map Component as Fallback
const StaticMapFallback = ({ center, className, height }) => {
  const { t, i18n } = useTranslation()
  
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <div className="relative w-full h-full bg-blue-50 dark:bg-blue-900/20">
        {/* Embedded Google Map */}
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.123456789!2d${center.lng}!3d${center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDE0JzM3LjMiTiA4OcKwNTUnMDYuNiJF!5e0!3m2!1sen!2sbd!4v1234567890123!5m2!1sen!2sbd`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={i18n.language === 'bn' ? 'দারুল উলুম সরকারি প্রাথমিক বিদ্যালয়' : 'Darul Ulum Government Primary School'}
        ></iframe>
        
        {/* Overlay with school info */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
            {i18n.language === 'bn' ? 'দারুল উলুম সরকারি প্রাথমিক বিদ্যালয়' : 'Darul Ulum Government Primary School'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {i18n.language === 'bn' ? 'আলিয়া মাদ্রাসা রোড, টাঙ্গাইল সদর, টাঙ্গাইল' : 'Alia Madrasa Road, Tangail Sadar, Tangail'}
          </p>
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
          >
            {i18n.language === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions'}
          </a>
        </div>
      </div>
    </div>
  )
}

// Load Google Maps Script
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById('googleMapsScript')
  if (!existingScript) {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.id = 'googleMapsScript'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    script.onload = () => {
      if (callback) callback()
    }
    script.onerror = () => {
      console.error('Failed to load Google Maps script')
      if (callback) callback(false)
    }
  } else {
    if (callback) callback()
  }
}

const SimpleMap = ({ center = SCHOOL_LOCATION, zoom = 16, height = '450px', className = '' }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [useStaticMap, setUseStaticMap] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    
    // First try to load interactive Google Maps
    loadGoogleMapsScript((success) => {
      if (success !== false && mapRef.current && !map && window.google) {
        try {
          const newMap = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            zoomControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative'
          })

          // Add marker
          const marker = new window.google.maps.Marker({
            position: center,
            map: newMap,
            title: i18n.language === 'bn' ? 'দারুল উলুম সরকারি প্রাথমিক বিদ্যালয়' : 'Darul Ulum Government Primary School'
          })

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: bold;">
                  ${i18n.language === 'bn' ? 'দারুল উলুম সরকারি প্রাথমিক বিদ্যালয়' : 'Darul Ulum Government Primary School'}
                </h3>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">
                  ${i18n.language === 'bn' ? 'আলিয়া মাদ্রাসা রোড, টাঙ্গাইল সদর, টাঙ্গাইল' : 'Alia Madrasa Road, Tangail Sadar, Tangail'}
                </p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}" 
                   target="_blank" 
                   style="background: #1e40af; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">
                  ${i18n.language === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions'}
                </a>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(newMap, marker)
          })

          setMap(newMap)
          setIsLoading(false)
        } catch (error) {
          console.error('Error initializing map:', error)
          setUseStaticMap(true)
          setIsLoading(false)
        }
      } else {
        console.log('Google Maps failed to load, using static map')
        setUseStaticMap(true)
        setIsLoading(false)
      }
    })
  }, [center, zoom, i18n.language])

  // Loading state
  if (isLoading) {
    return (
      <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('contact.loadingMap') || 'Loading map...'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Use static map fallback
  if (useStaticMap) {
    return <StaticMapFallback center={center} className={className} height={height} />
  }

  // Interactive map
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default SimpleMap