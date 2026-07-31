import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../../store/authSlice';
import { StaggerContainer, StaggerItem } from '../../components/motion/index.jsx';
import logo from '../../assets/logo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CHANGE_PASSWORD_ENDPOINT = `${API_BASE_URL}/api/users/change-password`;
const VERIFY_OTP_ENDPOINT = `${API_BASE_URL}/api/users/verify-change-password-otp`;

function ChangePassword() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Step state: 'password' or 'otp'
    const [step, setStep] = useState('password');
    const [passwordData, setPasswordData] = useState(null); // store to reuse in OTP step

    // Password visibility toggles
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // React Hook Form for Password Step
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        watch,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
        reset: resetPassword,
    } = useForm({
        defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    });

    // React Hook Form for OTP Step
    const {
        register: registerOtp,
        handleSubmit: handleOtpSubmit,
        formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
        reset: resetOtp,
    } = useForm({ defaultValues: { otp: '' } });

    const newPasswordValue = watch('newPassword');

    // Request OTP
    const onPasswordSubmit = async (data) => {
        try {
            const response = await fetch(CHANGE_PASSWORD_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                }),
                credentials: 'include',
            });

            const result = await response.json();
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Failed to send OTP');
            }

            toast.success(result.message || 'OTP sent to your email!');
            // Store password data for later use in OTP step
            setPasswordData({ newPassword: data.newPassword });
            setStep('otp');
            resetPassword();
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    //Verify OTP and complete change
    const onOtpSubmit = async (data) => {
        try {
            const response = await fetch(VERIFY_OTP_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: data.otp,
                    newPassword: passwordData.newPassword, // send new password again
                }),
                credentials: 'include',
            });

            const result = await response.json();
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'OTP verification failed');
            }

            toast.success(result.message || 'Password changed successfully!');
            resetOtp();
            // Refresh user and go to dashboard
            await dispatch(fetchCurrentUser()).unwrap();
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    //Render
    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white flex items-center justify-center px-4 py-10 overflow-x-hidden">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="bg-white border border-gray-100 rounded-2xl px-6 sm:px-8 py-8 shadow-lg">
                    {/* Logo */}
                    <motion.div
                        className="w-[80px] mx-auto mb-6"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Link to="/dashboard">
                            <img src={logo} alt="CProtocol Logo" className="w-full h-full" />
                        </Link>
                    </motion.div>

                    <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                        {step === 'password' ? 'Change Password' : 'Verify OTP'}
                    </h2>

                    {step === 'password' ? (
                        // Password Form
                        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
                            <StaggerContainer>
                                {/* Old Password */}
                                <StaggerItem>
                                    <div className="mb-4">
                                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Old Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="oldPassword"
                                                type={showOld ? 'text' : 'password'}
                                                placeholder="Enter current password"
                                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                                                    passwordErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                {...registerPassword('oldPassword', { required: 'Old password is required' })}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                                                onClick={() => setShowOld(!showOld)}
                                            >
                                                {showOld ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
                                            </button>
                                        </div>
                                        {passwordErrors.oldPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.oldPassword.message}</p>
                                        )}
                                    </div>
                                </StaggerItem>

                                {/* New Password */}
                                <StaggerItem>
                                    <div className="mb-4">
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="newPassword"
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="Enter new password"
                                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                                                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                {...registerPassword('newPassword', {
                                                    required: 'New password is required',
                                                    minLength: { value: 6, message: 'Minimum 6 characters' },
                                                })}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                                                onClick={() => setShowNew(!showNew)}
                                            >
                                                {showNew ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
                                            </button>
                                        </div>
                                        {passwordErrors.newPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                                        )}
                                    </div>
                                </StaggerItem>

                                {/* Confirm Password */}
                                <StaggerItem>
                                    <div className="mb-6">
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Confirm New Password *
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Re-enter new password"
                                                className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                                                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                {...registerPassword('confirmPassword', {
                                                    required: 'Please confirm your password',
                                                    validate: value => value === newPasswordValue || 'Passwords do not match',
                                                })}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                            >
                                                {showConfirm ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
                                            </button>
                                        </div>
                                        {passwordErrors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </StaggerItem>

                                {/* Submit */}
                                <StaggerItem>
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting}
                                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPasswordSubmitting ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </StaggerItem>

                                {/* Back to Dashboard */}
                                <StaggerItem>
                                    <p className="text-center text-sm text-gray-600 mt-4">
                                        <Link to="/dashboard" className="text-purple-600 hover:underline">
                                            ← Back to Dashboard
                                        </Link>
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                        </form>
                    ) : (
                        // OTP Verification
                        <form onSubmit={handleOtpSubmit(onOtpSubmit)} noValidate>
                            <StaggerContainer>
                                <StaggerItem>
                                    <div className="mb-6">
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Enter OTP sent to your email *
                                        </label>
                                        <input
                                            id="otp"
                                            type="text"
                                            placeholder="6-digit OTP"
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 text-sm ${
                                                otpErrors.otp ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            {...registerOtp('otp', {
                                                required: 'OTP is required',
                                                pattern: { value: /^[0-9]{6}$/, message: 'OTP must be 6 digits' },
                                            })}
                                        />
                                        {otpErrors.otp && (
                                            <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
                                        )}
                                    </div>
                                </StaggerItem>

                                <StaggerItem>
                                    <button
                                        type="submit"
                                        disabled={isOtpSubmitting}
                                        className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isOtpSubmitting ? 'Verifying...' : 'Verify & Change Password'}
                                    </button>
                                </StaggerItem>

                                <StaggerItem>
                                    <p className="text-center text-sm text-gray-600 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep('password')}
                                            className="text-purple-600 hover:underline"
                                        >
                                            ← Go back and request new OTP
                                        </button>
                                    </p>
                                </StaggerItem>
                            </StaggerContainer>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default ChangePassword;