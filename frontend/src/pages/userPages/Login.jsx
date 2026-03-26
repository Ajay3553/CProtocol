import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import logo from '../../assets/logo.png'

const FadeInWhenVisible = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
    }

    return (
        <motion.div
        className={className}
        initial={{ opacity: 0, ...directions[direction] }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        >
        {children}
        </motion.div>
    )
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

function Login() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
        } = useForm({
        defaultValues: {
        username: '',
        password: '',
        rememberMe: false
        }
    })

    const onSubmit = async (data) => {
        try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            username: data.username,
            password: data.password,
            rememberMe: data.rememberMe
            }),
            credentials: 'include'
        })

        const result = await response.json()

        if (!response.ok || !result?.success) {
            throw new Error(result?.message || 'Login failed')
        }

        toast.success(result.message || 'Welcome back!')
        reset()
        navigate('/channels', { replace: true })
        } catch (e) {
        console.error('Login error:', e)
        toast.error(e.message || 'Invalid username or password')
        }
    }

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
                Welcome back
            </motion.h1>
            <motion.p
                className="text-sm text-gray-500 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
            >
                Login to your <span className="text-purple-600 font-medium">CProtocol</span> account
            </motion.p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <StaggerContainer>

                {/* Username */}
                <StaggerItem>
                    <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Username or Email *
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
                        required: 'Username or email is required',
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
                        placeholder="Enter your password"
                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        whileFocus={{ scale: 1.01 }}
                        {...register('password', {
                            required: 'Password is required',
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

                {/* Remember Me */}
                <StaggerItem>
                    <div className="mb-6 flex items-center gap-2">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        {...register('rememberMe')}
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                        Remember me for 30 days
                    </label>
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
                        Logging in...
                        </span>
                    ) : (
                        'Login'
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

                {/* Signup Link */}
                <StaggerItem>
                    <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition-colors"
                    >
                        Create an account
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
            By logging in, you agree to CProtocol's Terms of Service
            </motion.p>
        </motion.div>
        </div>
    )
}

export default Login