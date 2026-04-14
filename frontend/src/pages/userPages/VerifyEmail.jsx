// src/pages/auth/VerifyEmail.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../../store/authSlice'
import logo from '../../assets/logo.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const ENDPOINTS = {
    signup: `${API_BASE_URL}/api/users/verify-email`,
    login: `${API_BASE_URL}/api/users/verify-login-email`,
    resend: `${API_BASE_URL}/api/users/resend-verify-email`,
}

const CONFIG = {
    signup: {
        title: 'Verify your email',
        subtitle: 'We sent a 6-digit code to',
        successMessage: 'Email verified successfully!',
        redirectTo: '/channels',
        backText: 'Wrong email?',
        backLink: '/register',
        backLabel: 'Sign up again',
        footerText: 'OTP expires in 10 minutes',
    },
    login: {
        title: 'Verify your login',
        subtitle: 'We sent a 6-digit code to',
        successMessage: 'Login verified successfully!',
        redirectTo: '/channels',
        backText: 'Wrong account?',
        backLink: '/login',
        backLabel: 'Try again',
        footerText: 'OTP expires in 10 minutes',
    },
}

const StaggerContainer = ({ children, className = '', staggerDelay = 0.08 }) => (
    <motion.div
        className={className}
        initial="hidden"
        animate="visible"
        variants={{
            hidden: {},
            visible: { transition: { staggerChildren: staggerDelay } },
        }}
    >
        {children}
    </motion.div>
)

const StaggerItem = ({ children, className = '' }) => (
    <motion.div
        className={className}
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: 'easeOut' },
            },
        }}
    >
        {children}
    </motion.div>
)

function VerifyEmail() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const email = location.state?.email || ''
    const type = location.state?.type || 'signup'
    const config = CONFIG[type] || CONFIG.signup

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const inputRefs = useRef([])

    useEffect(() => {
        if (!email) {
            toast.error(type === 'login' ? 'Please login first' : 'Please sign up first')
            navigate(type === 'login' ? '/login' : '/register', { replace: true })
        }
    }, [email, navigate, type])

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').trim()

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('')
            setOtp(digits)
            inputRefs.current[5]?.focus()
        }
    }

    const handleResendOtp = async () => {
        if (!email) return

        setIsResending(true)

        try {
            const response = await fetch(ENDPOINTS.resend, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result?.message || 'Failed to resend OTP')
            }

            toast.success(result?.message || 'OTP resent successfully!')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (e) {
            console.error('Resend OTP error:', e)
            toast.error(e.message || 'Failed to resend OTP. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const otpString = otp.join('')

        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(ENDPOINTS[type], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    userEnterToken: otpString,
                }),
                credentials: 'include'
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result?.message || 'Verification failed')
            }

            await dispatch(fetchCurrentUser()).unwrap()

            toast.success(result?.message || config.successMessage)

            setTimeout(() => {
                navigate('/channels', { replace: true })
            }, 100)

        } catch (e) {
            console.error('Verification error:', e)
            toast.error(e.message || 'Verification failed. Please try again.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setIsSubmitting(false)
        }
    }

    const maskedEmail = email? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => first + '*'.repeat(Math.min(middle.length, 4)) + domain) : ''

    if (!email) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white flex items-center justify-center px-4 py-10 overflow-x-hidden">

            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <motion.div
                    className="bg-white border border-gray-100 rounded-2xl px-6 sm:px-8 py-8 shadow-lg"
                    whileHover={{ boxShadow: '0 15px 40px rgba(147, 51, 234, 0.1)' }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Logo */}
                    <motion.div
                        className="w-[80px] mx-auto mb-3"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Link to="/">
                            <motion.img
                                src={logo}
                                alt="CProtocol Logo"
                                className="w-full h-full"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            />
                        </Link>
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                        className="text-center mb-4"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                    >
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">
                                {type === 'login' ? '🔐' : '📧'}
                            </span>
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="text-2xl font-bold text-center text-gray-800 mb-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        {config.title}
                    </motion.h1>
                    <motion.p
                        className="text-sm text-gray-500 text-center mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {config.subtitle}{' '}
                        <span className="text-purple-600 font-medium">{maskedEmail}</span>
                    </motion.p>

                    {/* OTP Form */}
                    <form onSubmit={handleSubmit}>
                        <StaggerContainer>

                            {/* OTP Inputs */}
                            <StaggerItem>
                                <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                                    {otp.map((digit, index) => (
                                        <motion.input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all duration-200 ${
                                                digit
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-300 bg-white text-gray-800'
                                            } focus:border-purple-600 focus:ring-2 focus:ring-purple-200`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + index * 0.05 }}
                                            whileFocus={{ scale: 1.05 }}
                                        />
                                    ))}
                                </div>
                            </StaggerItem>

                            {/* Submit Button */}
                            <StaggerItem>
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || otp.join('').length !== 6}
                                    className={`w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold shadow-md text-sm ${
                                        isSubmitting || otp.join('').length !== 6
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    whileHover={
                                        !isSubmitting && otp.join('').length === 6
                                            ? {
                                                scale: 1.02,
                                                boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                                            }
                                            : {}
                                    }
                                    whileTap={
                                        !isSubmitting && otp.join('').length === 6
                                            ? { scale: 0.98 }
                                            : {}
                                    }
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.span
                                                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                            />
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify Email'
                                    )}
                                </motion.button>
                            </StaggerItem>

                            {/* Resend OTP Button */}
                            <StaggerItem>
                                <div className="text-center mt-3">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isResending}
                                        className={`text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors ${
                                            isResending ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isResending ? 'Resending...' : "Didn't receive the code? Resend OTP"}
                                    </button>
                                </div>
                            </StaggerItem>

                            {/* Help Text */}
                            <StaggerItem>
                                <p className="text-center text-xs text-gray-400 mt-1">
                                    Please check your spam folder too
                                </p>
                            </StaggerItem>

                            {/* Divider */}
                            <StaggerItem>
                                <div className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400">OR</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                            </StaggerItem>

                            {/* Back Link */}
                            <StaggerItem>
                                <p className="text-center text-sm text-gray-600">
                                    {config.backText}{' '}
                                    <Link
                                        to={config.backLink}
                                        className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                                    >
                                        {config.backLabel}
                                    </Link>
                                </p>
                            </StaggerItem>

                        </StaggerContainer>
                    </form>
                </motion.div>

                <motion.p
                    className="text-center text-xs text-gray-400 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {config.footerText}
                </motion.p>
            </motion.div>
        </div>
    )
}

export default VerifyEmail