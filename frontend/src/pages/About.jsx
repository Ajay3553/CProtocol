import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

// Reusable animation wrappers
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

function About() {
  const { status: isLoggedIn } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800 overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About{' '}
          <motion.span
            className="text-purple-600 inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            CProtocol
          </motion.span>{' '}
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            🚀
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Communication Protocol is a secure, real-time messaging platform
          designed with privacy, scalability, and future encryption in mind.
        </motion.p>
      </section>

      {/* WHAT IS CPROTOCOL */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
        <FadeInWhenVisible direction="right">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">
              What is CProtocol?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              CProtocol is a modern chat system inspired by platforms like Slack
              and Discord. It enables users to communicate in real-time using
              channel-based messaging, role-based access control, and smart
              features like message expiration (TTL).
            </p>
          </div>
        </FadeInWhenVisible>

        <FadeInWhenVisible direction="left" delay={0.15}>
          <motion.div
            className="bg-white shadow-lg rounded-2xl p-6"
            whileHover={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              y: -3,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StaggerContainer className="space-y-3" staggerDelay={0.08}>
              {[
                '⚡ Real-time messaging (Socket.IO)',
                '👥 Channel-based communication',
                '🔐 Secure authentication (JWT)',
                '⏱ Self-destruct messages (TTL)',
                '🛡️ Role-based access (Admin / User)',
                '✍️ Typing indicators & online presence',
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <motion.li
                    className="text-gray-700 list-none"
                    whileHover={{ x: 8, color: '#7c3aed' }}
                    transition={{ duration: 0.2 }}
                  >
                    {item}
                  </motion.li>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        </FadeInWhenVisible>
      </section>

      {/* TECH STACK */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-semibold text-center mb-10 text-purple-900">
            Built With
          </h2>
        </FadeInWhenVisible>

        <StaggerContainer
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={0.12}
        >
          {[
            {
              category: 'Frontend',
              icon: '🎨',
              items: ['React + Vite', 'Tailwind CSS', 'Redux Toolkit', 'Socket.IO Client'],
            },
            {
              category: 'Backend',
              icon: '⚙️',
              items: ['Node.js + Express', 'Socket.IO', 'JWT Auth', 'MongoDB'],
            },
            {
              category: 'Security',
              icon: '🔐',
              items: [
                'JWT Access Tokens',
                'Role-based Permissions',
                'TTL Message Expiry',
                'AES + RSA (Planned)',
              ],
            },
          ].map((stack, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md h-full"
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  y: -5,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="text-3xl mb-3"
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {stack.icon}
                </motion.div>
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                  {stack.category}
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  {stack.items.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2"
                      whileHover={{ x: 6, color: '#7c3aed' }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"
                        whileHover={{ scale: 1.8 }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* WHAT SETS US APART */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-semibold text-center mb-10 text-purple-900">
            What Sets Us Apart
          </h2>
        </FadeInWhenVisible>

        <StaggerContainer
          className="grid md:grid-cols-2 gap-6"
          staggerDelay={0.1}
        >
          {[
            {
              title: '🧹 No Message Hoarding',
              desc: 'Unlike traditional platforms, CProtocol supports TTL — messages self-destruct after a set time, leaving no traces behind.',
            },
            {
              title: '🏗️ Encryption-First Architecture',
              desc: 'The entire system is designed with end-to-end encryption in mind from day one. AES-256 + RSA integration is on the roadmap.',
            },
            {
              title: '🎯 Minimal & Focused',
              desc: 'No bloated features. CProtocol focuses on fast, secure, and organized communication — nothing more, nothing less.',
            },
            {
              title: '🔓 Open & Transparent',
              desc: 'Built with modern open-source technologies. Every design decision prioritizes user privacy and data ownership.',
            },
          ].map((item, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md h-full"
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  y: -4,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.h3
                  className="text-lg font-semibold mb-2 text-purple-800"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.title}
                </motion.h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ENCRYPTION ROADMAP */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-semibold text-center mb-10 text-purple-900">
            🔐 Encryption Roadmap
          </h2>
        </FadeInWhenVisible>

        <StaggerContainer
          className="grid sm:grid-cols-3 gap-6 text-center"
          staggerDelay={0.15}
        >
          {[
            {
              phase: 'Phase 1',
              status: '✅ Done',
              title: 'Secure Auth',
              desc: 'JWT-based authentication with protected routes and role-based access.',
              statusColor: 'text-green-600',
              bgHover: 'rgba(34, 197, 94, 0.08)',
            },
            {
              phase: 'Phase 2',
              status: '✅ Done',
              title: 'Message TTL',
              desc: 'Self-destructing messages with configurable time-to-live expiry.',
              statusColor: 'text-green-600',
              bgHover: 'rgba(34, 197, 94, 0.08)',
            },
            {
              phase: 'Phase 3',
              status: '🔜 Upcoming',
              title: 'E2E Encryption',
              desc: 'AES-256 message encryption with RSA/ECDH key exchange between clients.',
              statusColor: 'text-yellow-600',
              bgHover: 'rgba(234, 179, 8, 0.08)',
            },
          ].map((phase, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md h-full"
                whileHover={{
                  scale: 1.04,
                  backgroundColor: phase.bgHover,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.p
                  className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                >
                  {phase.phase}
                </motion.p>

                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {phase.status.includes('Upcoming') && (
                    <motion.span
                      className="w-2 h-2 bg-yellow-500 rounded-full"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [1, 0.6, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <p className={`text-sm font-semibold ${phase.statusColor}`}>
                    {phase.status}
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  {phase.title}
                </h3>
                <p className="text-gray-600 text-sm">{phase.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <FadeInWhenVisible>
          <motion.div
            className="bg-purple-800 text-white rounded-2xl p-8 text-center shadow-lg"
            whileHover={{
              boxShadow: '0 15px 40px rgba(88, 28, 135, 0.4)',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="text-2xl font-semibold mb-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Our Mission 🎯
            </motion.h2>
            <motion.p
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
            >
              To build a secure and scalable communication platform that gives
              users full control over their data while maintaining seamless
              real-time interaction.
            </motion.p>
          </motion.div>
        </FadeInWhenVisible>
      </section>

      {/* CTA */}
      <section className="text-center py-12 px-6">
        <FadeInWhenVisible>
          <h2 className="text-2xl font-semibold mb-4 text-purple-900">
            {isLoggedIn ? 'Jump into your conversations' : 'Want to try CProtocol?'}
          </h2>
        </FadeInWhenVisible>

        <FadeInWhenVisible delay={0.15}>
          <Link to={isLoggedIn ? '/channels' : '/register'}>
            <motion.span
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg"
              whileHover={{
                scale: 1.06,
                boxShadow: '0 12px 35px rgba(147, 51, 234, 0.45)',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {isLoggedIn ? 'Open Channels 💬' : 'Get Started →'}
            </motion.span>
          </Link>
        </FadeInWhenVisible>
      </section>

      {/* FOOTER */}
      <motion.footer
        className="text-center py-6 text-gray-500 text-sm border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        © 2026 CProtocol. All Rights Reserved.
      </motion.footer>
    </div>
  );
}

export default About;