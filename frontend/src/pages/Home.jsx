import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Reusable animation wrapper
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

// Stagger container
const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-50px' }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: staggerDelay } },
    }}
  >
    {children}
  </motion.div>
)

// Stagger child
const StaggerItem = ({ children, className = '' }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    }}
  >
    {children}
  </motion.div>
)

function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800 overflow-x-hidden'>

      {/* HERO SECTION */}
      <section className='max-w-6xl mx-auto px-6 pt-20 pb-16 text-center'>
        <motion.p
          className='text-sm uppercase tracking-widest text-purple-500 font-semibold mb-3'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Communication Protocol
        </motion.p>

        <motion.h1
          className='text-4xl md:text-6xl font-bold mb-6 leading-tight'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Messaging,{' '}
          <motion.span
            className='text-purple-600 inline-block'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            Redefined
          </motion.span>{' '}
          <motion.span
            className='inline-block'
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
          >
            🚀
          </motion.span>
        </motion.h1>

        <motion.p
          className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          A secure, real-time messaging platform built for teams and individuals.
          Channel-based chat, self-destructing messages, and blazing-fast delivery
          — all in one place.
        </motion.p>

        <motion.div
          className='flex flex-col sm:flex-row justify-center gap-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to='/register'>
            <motion.span
              className='inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg w-full sm:w-auto'
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Get Started — It's Free
            </motion.span>
          </Link>
          <Link to='/login'>
            <motion.span
              className='inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold w-full sm:w-auto'
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgb(147, 51, 234)',
                color: '#ffffff',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Login
            </motion.span>
          </Link>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className='max-w-6xl mx-auto px-6 py-16'>
        <FadeInWhenVisible>
          <h2 className='text-3xl font-semibold text-center mb-4 text-purple-900'>
            Why CProtocol?
          </h2>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.1}>
          <p className='text-center text-gray-500 mb-12 max-w-xl mx-auto'>
            Everything you need for secure, organized, and real-time communication.
          </p>
        </FadeInWhenVisible>

        <StaggerContainer
          className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
          staggerDelay={0.1}
        >
          {[
            {
              icon: '⚡',
              title: 'Real-time Messaging',
              desc: 'Instant message delivery powered by Socket.IO with zero perceptible delay.',
            },
            {
              icon: '📢',
              title: 'Channel-based Chat',
              desc: 'Create group channels or private 1:1 conversations to keep things organized.',
            },
            {
              icon: '🔐',
              title: 'JWT Authentication',
              desc: 'Industry-standard token-based auth to keep your account safe and sessions secure.',
            },
            {
              icon: '⏱',
              title: 'Self-Destruct Messages',
              desc: 'Set a TTL on messages — they automatically vanish after expiry. No traces left.',
            },
            {
              icon: '🟢',
              title: 'Online Presence',
              desc: "See who's online and get real-time typing indicators while chatting.",
            },
            {
              icon: '🛡️',
              title: 'Role-based Access',
              desc: 'Admin and User roles with granular permissions for full control over channels.',
            },
          ].map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                className='bg-white p-6 rounded-xl shadow-md cursor-default h-full'
                whileHover={{
                  scale: 1.04,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  y: -5,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className='text-4xl mb-3'
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className='text-lg font-semibold mb-2 text-purple-800'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {feature.desc}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* HOW IT WORKS */}
      <section className='max-w-6xl mx-auto px-6 py-16'>
        <FadeInWhenVisible>
          <h2 className='text-3xl font-semibold text-center mb-12 text-purple-900'>
            How It Works
          </h2>
        </FadeInWhenVisible>

        <StaggerContainer
          className='grid sm:grid-cols-3 gap-8 text-center'
          staggerDelay={0.15}
        >
          {[
            {
              step: '01',
              title: 'Create an Account',
              desc: 'Sign up in seconds with just your email and a password.',
            },
            {
              step: '02',
              title: 'Join or Create Channels',
              desc: 'Start a group channel or open a private 1:1 conversation.',
            },
            {
              step: '03',
              title: 'Start Messaging',
              desc: 'Send real-time messages, set TTL, and collaborate instantly.',
            },
          ].map((item, index) => (
            <StaggerItem key={index} className='flex flex-col items-center'>
              <motion.div
                className='w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg'
                whileHover={{ scale: 1.15, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 200, duration: 0.6 }}
              >
                {item.step}
              </motion.div>

              {/* Connector line */}
              {index < 2 && (
                <motion.div
                  className='hidden sm:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-purple-200'
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.2, duration: 0.6 }}
                  style={{ originX: 0 }}
                />
              )}

              <h3 className='text-lg font-semibold text-purple-800 mb-2'>
                {item.title}
              </h3>
              <p className='text-gray-600 text-sm max-w-xs'>
                {item.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* STATS / HIGHLIGHTS */}
      <section className='max-w-6xl mx-auto px-6 py-12'>
        <FadeInWhenVisible>
          <div className='bg-white rounded-2xl shadow-lg p-10'>
            <StaggerContainer
              className='grid grid-cols-2 sm:grid-cols-4 gap-6 text-center'
              staggerDelay={0.12}
            >
              {[
                { value: '< 50ms', label: 'Message Latency' },
                { value: '256-bit', label: 'Encryption Ready' },
                { value: '∞', label: 'Channels Supported' },
                { value: '24/7', label: 'Real-time Uptime' },
              ].map((stat, index) => (
                <StaggerItem key={index}>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.p
                      className='text-2xl sm:text-3xl font-bold text-purple-600'
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                      }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className='text-gray-500 text-xs sm:text-sm mt-1'>
                      {stat.label}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* FUTURE ENCRYPTION BANNER */}
      <section className='max-w-6xl mx-auto px-6 py-12'>
        <FadeInWhenVisible direction='left'>
          <motion.div
            className='bg-purple-800 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg'
            whileHover={{ boxShadow: '0 15px 40px rgba(88, 28, 135, 0.4)' }}
            transition={{ duration: 0.3 }}
          >
            <div className='mb-6 md:mb-0'>
              <motion.h2
                className='text-xl sm:text-2xl font-semibold mb-2'
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                🔮 Coming Soon: End-to-End Encryption
              </motion.h2>
              <motion.p
                className='text-purple-200 max-w-lg text-sm sm:text-base'
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                AES-256 + RSA/ECDH encryption is on the roadmap. Your messages
                will soon be unreadable — even to our servers.
              </motion.p>
            </div>
            <Link to='/about'>
              <motion.span
                className='inline-block bg-white text-purple-800 px-6 py-3 rounded-lg font-semibold whitespace-nowrap'
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 5px 20px rgba(255,255,255,0.3)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                Learn More →
              </motion.span>
            </Link>
          </motion.div>
        </FadeInWhenVisible>
      </section>

      {/* FINAL CTA */}
      <section className='text-center py-16 px-6'>
        <FadeInWhenVisible>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Ready to{' '}
            <motion.span
              className='text-purple-600 inline-block'
              whileHover={{ scale: 1.05 }}
            >
              communicate securely
            </motion.span>
            ?
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.15}>
          <p className='text-gray-600 max-w-xl mx-auto mb-8'>
            Join CProtocol today and experience real-time messaging the way it should be.
          </p>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.3}>
          <Link to='/register'>
            <motion.span
              className='inline-block bg-purple-600 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg'
              whileHover={{
                scale: 1.06,
                boxShadow: '0 12px 35px rgba(147, 51, 234, 0.45)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Get Started Now
            </motion.span>
          </Link>
        </FadeInWhenVisible>
      </section>

      {/* FOOTER */}
      <motion.footer
        className='text-center py-6 text-gray-500 text-sm border-t border-gray-200'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        © 2026 CProtocol. All Rights Reserved.
      </motion.footer>
    </div>
  )
}

export default Home