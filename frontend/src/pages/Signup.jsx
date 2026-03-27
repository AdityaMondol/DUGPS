import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { User, Mail, Lock, UserPlus, Eye, EyeOff, ShieldCheck, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const Signup = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    teacherCode: '',
  })

  // Predefined teacher code for security
  const VALID_TEACHER_CODE = 'DUGPS-1928'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate teacher code if role is teacher
    if (formData.role === 'teacher' && formData.teacherCode !== VALID_TEACHER_CODE) {
      toast.error('Invalid Teacher Verification Code')
      return
    }

    setLoading(true)
    try {
      // 1. Sign up user with email & password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role
          }
        }
      })

      if (authError) throw authError

      // 2. Create profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            email: formData.email
          }
        ])

      if (profileError) throw profileError

      toast.success('Account created successfully! Redirecting...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-full rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 blur-full rounded-full" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card !p-10 order-2 lg:order-1"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
                {t('auth.createAccount')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold underline transition-all">
                  {t('auth.loginHere')}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {t('auth.firstName')}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {t('auth.lastName')}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-12 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  {t('auth.role')}
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['student', 'teacher', 'guardian'].map((role) => (
                    <label
                      key={role}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        formData.role === role
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-indigo-100 dark:shadow-none'
                          : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className={`text-sm font-bold capitalize ${
                        formData.role === role ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'
                      }`}>
                        {t(`auth.${role}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Teacher Verification Code */}
              {formData.role === 'teacher' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-indigo-600 ml-1">
                    Teacher Verification Code
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      name="teacherCode"
                      value={formData.teacherCode}
                      onChange={handleChange}
                      className="input-field pl-12 border-indigo-200 bg-indigo-50/50"
                      placeholder="Enter verification code"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-lg font-bold"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-6 h-6" />
                    {t('auth.signupButton')}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2 space-y-10"
          >
            <div className="space-y-6">
               <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
                 Join Our <span className="text-indigo-600">Educational</span> Legacy
               </h2>
               <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                 Get full access to your personalized dashboard, school notices, and academic tools. 
                 Start your journey with us today.
               </p>
            </div>

            <div className="grid gap-6">
                {[
                  { icon: UserPlus, title: "Simple Setup", desc: "Create your account in seconds." },
                  { icon: Lock, title: "Data Security", desc: "Your personal info is fully encrypted." },
                  { icon: Star, title: "Full Access", desc: "Unlock premium academic resources." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-slate-900/50 border border-indigo-100/50 dark:border-slate-800">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                      <item.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Signup
