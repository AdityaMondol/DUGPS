import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabase'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      // 2. Fetch User Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) throw profileError

      // 3. Update auth store
      setAuth({ 
        id: authData.user.id, 
        email: authData.user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      }, authData.session.access_token)
      
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 blur-full rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 blur-full rounded-full" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block space-y-8"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-2xl" />
              <div className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-12 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <LogIn className="w-32 h-32 text-indigo-500" />
                </div>
                
                <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                  Welcome <span className="text-indigo-600">Back!</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
                  Secure access to your academic records, class schedules, and community updates.
                </p>
                
                <div className="space-y-6">
                  {[
                    { icon: LogIn, text: "Fast Secure Authentication" },
                    { icon: ShieldCheck, text: "End-to-End Encryption" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card !p-10"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
                {t('auth.login')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold underline">
                  {t('auth.signupHere')}
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

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
                    <LogIn className="w-6 h-6" />
                    {t('auth.loginButton')}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
