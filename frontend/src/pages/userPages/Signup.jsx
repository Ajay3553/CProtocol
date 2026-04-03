import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { StaggerContainer, StaggerItem, FadeInWhenVisible } from '../../components/motion/index.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/users/register`

function Signup() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(null)

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
        }
    })

    const passwordValue = watch('password')

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
        const reader = new FileReader()
        reader.onloadend = () => setAvatarPreview(reader.result)
        reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data) => {
        try {
            const formData = new FormData()
            formData.append('fullName', data.fullName)
            formData.append('email', data.email)
            formData.append('username', data.username)
            formData.append('password', data.password)

            if (data.avatar && data.avatar[0]) {
                formData.append('avatar', data.avatar[0])
            }

            const response = await fetch(REGISTER_ENDPOINT, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })

            const result = await response.json()

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Signup failed')
            }

            toast.success(result.message || 'OTP sent to your email!')
            reset()
            setAvatarPreview(null)

            navigate('/verify-email', {
                state: { email: data.email },
                replace: true
            })
        } catch (e) {
            console.error('Signup error:', e)
            toast.error(e.message || 'Signup failed, try again.')
        }
    }

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' }
        let score = 0
        if (password.length >= 6) score++
        if (password.length >= 10) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 1) return { level: 1, text: 'Weak', color: 'bg-red-500' }
        if (score <= 2) return { level: 2, text: 'Fair', color: 'bg-yellow-500' }
        if (score <= 3) return { level: 3, text: 'Good', color: 'bg-blue-500' }
        return { level: 4, text: 'Strong', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength(passwordValue)

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white flex items-center justify-center px-4 py-10 overflow-x-hidden">

        <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Card */}
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

            {/* Title */}
            <motion.h1
                className="text-2xl font-bold text-center text-gray-800 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
            >
                Create your account
            </motion.h1>
            <motion.p
                className="text-sm text-gray-500 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
            >
                Join <span className="text-purple-600 font-medium">CProtocol</span> and start messaging securely
            </motion.p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <StaggerContainer>

                {/* Avatar Upload */}
                <StaggerItem>
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Image <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="flex items-center gap-4">
                        {/* Preview Circle */}
                        <motion.div
                            className="w-16 h-16 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center overflow-hidden bg-purple-50 flex-shrink-0"
                            whileHover={{ borderColor: 'rgb(147, 51, 234)', scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AnimatePresence mode="wait">
                            {avatarPreview ? (
                                <motion.img
                                key="preview"
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="w-full h-full object-cover rounded-full"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                                />
                            ) : (
                                <motion.span
                                key="placeholder"
                                className="text-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                >
                                👤
                                </motion.span>
                            )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="flex-1">
                            <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer file:transition-colors cursor-pointer"
                            {...register('avatar', {
                                onChange: handleAvatarChange
                            })}
                            />
                        </div>
                        </div>
                    </div>
                </StaggerItem>

                {/* Full Name */}
                <StaggerItem>
                    <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name *
                    </label>
                    <motion.input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('fullName', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Minimum 2 characters' }
                        })}
                    />
                    {errors.fullName && (
                        <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        >
                        {errors.fullName.message}
                        </motion.p>
                    )}
                    </div>
                </StaggerItem>

                {/* Username */}
                <StaggerItem>
                    <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Username *
                    </label>
                    <motion.input
                        id="username"
                        type="text"
                        placeholder="johndoe123"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Minimum 3 characters' },
                        pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: 'Only letters, numbers, and underscores'
                        }
                        })}
                    />
                    {errors.username && (
                        <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        >
                        {errors.username.message}
                        </motion.p>
                    )}
                    </div>
                </StaggerItem>

                {/* Email */}
                <StaggerItem>
                    <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                    </label>
                    <motion.input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Enter a valid email'
                        }
                        })}
                    />
                    {errors.email && (
                        <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        >
                        {errors.email.message}
                        </motion.p>
                    )}
                    </div>
                </StaggerItem>

                {/* Password */}
                <StaggerItem>
                    <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password *
                    </label>
                    <div className="relative">
                        <motion.input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Minimum 6 characters' }
                        })}
                        />
                        <motion.button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        >
                        {showPassword ? (
                            <IoEyeOffOutline className="text-lg" />
                        ) : (
                            <IoEyeOutline className="text-lg" />
                        )}
                        </motion.button>
                    </div>

                    {/* Password Strength Bar */}
                    <AnimatePresence>
                        {passwordValue && (
                        <motion.div
                            className="mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4].map((level) => (
                                <motion.div
                                key={level}
                                className={`h-1 flex-1 rounded-full ${
                                    level <= passwordStrength.level
                                    ? passwordStrength.color
                                    : 'bg-gray-200'
                                }`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: level * 0.08, duration: 0.3 }}
                                style={{ originX: 0 }}
                                />
                            ))}
                            </div>
                            <p className={`text-xs ${
                            passwordStrength.level <= 1 ? 'text-red-500' :
                            passwordStrength.level <= 2 ? 'text-yellow-600' :
                            passwordStrength.level <= 3 ? 'text-blue-600' :
                            'text-green-600'
                            }`}>
                            {passwordStrength.text}
                            </p>
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {errors.password && (
                        <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        >
                        {errors.password.message}
                        </motion.p>
                    )}
                    </div>
                </StaggerItem>

                {/* Confirm Password */}
                <StaggerItem>
                    <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <motion.input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (val) =>
                            val === passwordValue || 'Passwords do not match'
                        })}
                        />
                        <motion.button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        >
                        {showConfirmPassword ? (
                            <IoEyeOffOutline className="text-lg" />
                        ) : (
                            <IoEyeOutline className="text-lg" />
                        )}
                        </motion.button>
                    </div>
                    {errors.confirmPassword && (
                        <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        >
                        {errors.confirmPassword.message}
                        </motion.p>
                    )}
                    </div>
                </StaggerItem>

                {/* Submit Button */}
                <StaggerItem>
                    <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold shadow-md text-sm ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={
                        !isSubmitting
                        ? {
                            scale: 1.02,
                            boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                            }
                        : {}
                    }
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    transition={{ type: 'spring', stiffness: 300 }}
                    >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                        <motion.span
                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        Creating account...
                        </span>
                    ) : (
                        'Create Account'
                    )}
                    </motion.button>
                </StaggerItem>

                {/* Divider */}
                <StaggerItem>
                    <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                    </div>
                </StaggerItem>

                {/* Login Link */}
                <StaggerItem>
                    <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                    >
                        Log in
                    </Link>
                    </p>
                </StaggerItem>

                </StaggerContainer>
            </form>
            </motion.div>

            {/* Bottom text */}
            <motion.p
            className="text-center text-xs text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            >
            By signing up, you agree to CProtocol's Terms of Service
            </motion.p>
        </motion.div>
        </div>
    )
}

export default Signup