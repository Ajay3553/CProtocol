import React, { useState } from 'react'
import Container from './Container'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { TfiAlignJustify } from "react-icons/tfi"
import { IoClose } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../store/authSlice'

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status: isLoggedIn, userData: user } = useSelector((state) => state.auth)

    const navItems = [
        {
            name: 'Home',
            slug: '/'
        },
        {
            name: 'Channels',
            slug: '/channels',
            highlighted: true
        },
        {
            name: 'About',
            slug: '/about'
        },
        {
            name: 'Contact',
            slug: '/contact-us'
        },
    ]

    const isActive = (slug) => {
        if (slug === '/') return location.pathname === '/'
        return location.pathname.startsWith(slug)
    }

    const navItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.08,
                duration: 0.4,
                ease: 'easeOut',
            },
        }),
    }

    const panelLinkVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.1 + i * 0.07,
                duration: 0.3,
                ease: 'easeOut',
            },
        }),
        exit: { opacity: 0, x: 30, transition: { duration: 0.15 } },
    }

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    }

    const panelVariants = {
        hidden: { x: '100%' },
        visible: {
            x: 0,
            transition: { type: 'spring', damping: 25, stiffness: 200 },
        },
        exit: {
            x: '100%',
            transition: { type: 'tween', duration: 0.25, ease: 'easeIn' },
        },
    }

    const authVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delay: 0.35, duration: 0.4, ease: 'easeOut' },
        },
        exit: { opacity: 0, y: 20, transition: { duration: 0.15 } },
    }

    const handleLogout = () => {
        dispatch(logoutUser())
        setIsMenuOpen(false)
        navigate('/')
    }

    return (
        <>
            <motion.header
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='sticky top-0 z-30 bg-gradient-to-r from-purple-300 to-pink-300 shadow-sm'
            >
                <Container>
                    <nav className='flex items-center justify-between w-full h-14'>

                        {/* Logo */}
                        <Link to="/" className='flex items-center gap-2'>
                            <motion.img
                                src={logo}
                                alt="CProtocol logo"
                                className='w-[80px] h-[45px] object-cover hidden sm:block'
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            />
                            <motion.span
                                className='sm:hidden text-lg font-bold text-purple-800'
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                CProtocol
                            </motion.span>
                        </Link>

                        {/* Desktop Nav */}
                        <ul className='hidden md:flex items-center gap-1 lg:gap-3'>
                            {navItems.map((item, i) => (
                                <motion.li
                                    key={item.name}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={navItemVariants}
                                >
                                    <Link to={item.slug} className='relative'>
                                        <motion.span
                                            className={`
                                                inline-block px-3 py-1.5 text-sm lg:text-base
                                                transition-colors duration-300 rounded-full
                                                ${item.highlighted
                                                    ? 'bg-purple-600 text-white font-semibold shadow-md'
                                                    : isActive(item.slug)
                                                        ? 'text-white font-semibold bg-white/20'
                                                        : 'text-gray-800 hover:text-white'
                                                }
                                            `}
                                            whileHover={
                                                item.highlighted
                                                    ? { scale: 1.08, boxShadow: '0 4px 20px rgba(147, 51, 234, 0.5)' }
                                                    : { scale: 1.05 }
                                            }
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {item.name}
                                            {isActive(item.slug) && !item.highlighted && (
                                                <motion.div
                                                    layoutId='activeNavUnderline'
                                                    className='absolute -bottom-1 left-2 right-2 h-0.5 bg-white rounded-full'
                                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                />
                                            )}
                                        </motion.span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>

                        {/* Right Side */}
                        <div className='flex items-center gap-3'>
                            {isLoggedIn && user ? (
                                <motion.div
                                    className='hidden sm:flex items-center gap-2'
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Link to='/dashboard'>
                                        {user?.avatar ? (
                                            <motion.img
                                                src={user.avatar}
                                                alt={user.username}
                                                className='w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-purple-600'
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.9 }}
                                            />
                                        ) : (
                                            <motion.div
                                                className='w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold cursor-pointer'
                                                whileHover={{ scale: 1.15, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                            </motion.div>
                                        )}
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className='hidden sm:flex items-center gap-2'
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                >
                                    <Link to='/login'>
                                        <motion.span
                                            className='text-sm text-purple-800 font-medium px-3 py-1.5'
                                            whileHover={{ color: '#ffffff' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Login
                                        </motion.span>
                                    </Link>
                                    <Link to='/register'>
                                        <motion.span
                                            className='text-sm bg-white text-purple-700 font-semibold px-4 py-1.5 rounded-full shadow-sm inline-block'
                                            whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Sign Up
                                        </motion.span>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Hamburger */}
                            <motion.button
                                className='p-2 rounded-lg hover:bg-white/20 transition-colors'
                                onClick={() => setIsMenuOpen(true)}
                                aria-label='Open menu'
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <TfiAlignJustify className='text-xl sm:text-2xl text-gray-800' />
                            </motion.button>
                        </div>
                    </nav>
                </Container>
            </motion.header>

            {/* Overlay + Side Panel */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            className='fixed inset-0 bg-black/50 z-40'
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        <motion.div
                            key="panel"
                            className='fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-50 flex flex-col'
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Panel Header */}
                            <div className='flex items-center justify-between p-4 border-b border-gray-100'>
                                <motion.span
                                    className='text-lg font-semibold text-purple-800'
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    Menu
                                </motion.span>
                                <motion.button
                                    onClick={() => setIsMenuOpen(false)}
                                    className='p-2 hover:bg-red-100 rounded-full transition-colors'
                                    aria-label='Close menu'
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <IoClose className='text-2xl text-gray-700' />
                                </motion.button>
                            </div>

                            {/* Panel Nav Links */}
                            <div className='p-4 flex-1 overflow-y-auto'>
                                <ul className='space-y-1'>
                                    {navItems.map((item, i) => (
                                        <motion.li
                                            key={item.name}
                                            custom={i}
                                            variants={panelLinkVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <Link
                                                to={item.slug}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <motion.div
                                                    className={`
                                                        flex items-center justify-between px-4 py-3 rounded-lg
                                                        ${isActive(item.slug)
                                                            ? 'bg-purple-100 text-purple-700 font-semibold'
                                                            : 'text-gray-700'
                                                        }
                                                        ${item.highlighted && !isActive(item.slug)
                                                            ? 'text-purple-600 font-medium'
                                                            : ''
                                                        }
                                                    `}
                                                    whileHover={{
                                                        backgroundColor: isActive(item.slug)
                                                            ? 'rgb(233, 213, 255)'
                                                            : 'rgb(243, 244, 246)',
                                                        x: 6,
                                                    }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span>{item.name}</span>
                                                    {item.highlighted && (
                                                        <motion.span
                                                            className='text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold'
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                delay: 0.3 + i * 0.07,
                                                                type: 'spring',
                                                                stiffness: 400,
                                                            }}
                                                        >
                                                            CHAT
                                                        </motion.span>
                                                    )}
                                                </motion.div>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <motion.div
                                className='border-t border-gray-100 mx-4'
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                            />

                            <motion.div
                                className='p-4'
                                variants={authVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {isLoggedIn && user ? (
                                    <div className='space-y-3'>
                                        <Link
                                        to='/dashboard'
                                        onClick={() => setIsMenuOpen(false)}
                                        >
                                            <motion.div
                                                className='flex items-center gap-3 p-3 bg-purple-50 rounded-lg'
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                {user?.avatar ? (
                                                    <motion.img
                                                        src={user.avatar}
                                                        alt={user.username}
                                                        className='w-10 h-10 rounded-full object-cover border-2 border-purple-300'
                                                        whileHover={{ scale: 1.1 }}
                                                    />
                                                ) : (
                                                    <motion.div
                                                        className='w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold'
                                                        whileHover={{ rotate: 10 }}
                                                    >
                                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </motion.div>
                                                )}
                                                <div>
                                                    <p className='font-semibold text-gray-800 text-sm'>
                                                        {user?.fullName || user?.username || 'User'}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>
                                                        @{user?.username || ''}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <Link
                                            to='/channels'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <motion.div
                                                className='px-4 py-3 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-2'
                                                whileHover={{ backgroundColor: 'rgb(243, 232, 255)', x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                💬 My Channels
                                            </motion.div>
                                        </Link>

                                        <motion.button
                                            className='w-full text-left px-4 py-3 text-red-600 rounded-lg text-sm font-medium'
                                            whileHover={{ backgroundColor: 'rgb(254, 226, 226)', x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div className='space-y-2'>
                                        <Link
                                            to='/login'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <motion.div
                                                className='w-full text-center px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold'
                                                whileHover={{
                                                    scale: 1.03,
                                                    backgroundColor: 'rgb(250, 245, 255)',
                                                }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                Login
                                            </motion.div>
                                        </Link>
                                        <Link
                                            to='/register'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <motion.div
                                                className='w-full text-center px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow mt-2'
                                                whileHover={{
                                                    scale: 1.03,
                                                    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                                                }}
                                                whileTap={{ scale: 0.97 }}
                                            >
                                                Get Started
                                            </motion.div>
                                        </Link>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                className='p-4 border-t border-gray-100'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <p className='text-xs text-gray-400 text-center'>
                                    © 2026 CProtocol
                                </p>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Header