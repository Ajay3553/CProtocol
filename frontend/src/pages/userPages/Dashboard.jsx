import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  IoChatbubbleEllipsesOutline,
  IoPeopleOutline,
  IoBarChartOutline,
  IoFlashOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoArrowForwardOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5'

// constants
const AVATAR_COLORS = ['#7c3aed','#0891b2','#059669','#d97706','#db2777','#ea580c','#4f46e5','#0d9488']

const getInitial  = (str) => str?.charAt(0)?.toUpperCase() || '?'
const getAvatarColor = (id) => {
  if (!id) return AVATAR_COLORS[0]
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

//animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

//StatCard
const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(124,58,237,0.10)' }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
  >
    {/* subtle background accent */}
    <div
      className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.07]"
      style={{ background: color }}
    />
    <div className="flex items-center gap-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: color + '15' }}
      >
        <Icon className="text-xl" style={{ color }} />
      </div>
      <div>
        <motion.p
          className="text-2xl font-bold text-gray-800 tabular-nums"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        >
          {value}
        </motion.p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  </motion.div>
)

//QuickAction
const QuickAction = ({ icon: Icon, label, desc, onClick, color }) => (
  <motion.button
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-xl border border-purple-50 bg-purple-50/60 px-4 py-3 text-left transition-colors hover:bg-purple-100/60"
  >
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{ background: color + '18' }}
    >
      <Icon className="text-base" style={{ color }} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
    <IoArrowForwardOutline className="shrink-0 text-gray-300 text-sm" />
  </motion.button>
)

// main
function Dashboard() {
  const navigate = useNavigate()
  const { channels = [] }      = useSelector((s) => s.channels)
  const { byChannel = {} }     = useSelector((s) => s.messages)
  const { userData: user }     = useSelector((s) => s.auth)

  //stats
  const totalChannels = channels.length

  const totalMessages = useMemo(
    () => Object.values(byChannel).reduce((sum, msgs) => sum + (msgs?.length || 0), 0),
    [byChannel]
  )

  const allParticipants = useMemo(() => {
    const seen = new Set()
    channels.forEach((ch) =>
      ch.participants?.forEach((p) => {
        const id = (p.user?._id || p.user)?.toString()
        if (id) seen.add(id)
      })
    )
    return seen.size
  }, [channels])

  // most active channel (most messages)
  const mostActive = useMemo(() => {
    let best = null, bestCount = 0
    channels.forEach((ch) => {
      const count = (byChannel[ch._id] || []).filter((m) => !m.isDeleted).length
      if (count > bestCount) { best = ch; bestCount = count }
    })
    return best ? { name: best.name || 'Direct Chat', count: bestCount } : null
  }, [channels, byChannel])

  // channel activity for bar chart (top 7)
  const channelActivity = useMemo(() =>
    channels
      .map((ch) => ({
        name:  ch.name || 'Direct',
        count: (byChannel[ch._id] || []).filter((m) => !m.isDeleted).length,
        id:    ch._id,
        updatedAt: ch.updatedAt,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7),
    [channels, byChannel]
  )
  const maxCount = Math.max(...channelActivity.map((c) => c.count), 1)

  // recently active channels (sorted by updatedAt, top 5)
  const recentChannels = useMemo(() =>
    [...channels]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
    [channels]
  )

  // greeting
  const hour = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = user?.fullName || user?.username || 'there'
  const avatarColor = getAvatarColor(user?._id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/60 via-white to-purple-50/30 p-4 sm:p-6 lg:p-8">

      {/*Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          {/* user avatar */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-md ring-2 ring-purple-200"
            style={{ background: user?.avatar ? undefined : avatarColor }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
              : getInitial(displayName)
            }
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {greeting}, <span className="text-purple-600">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-gray-400">Here's your workspace overview for today.</p>
          </div>
        </div>

        {/* live date/time pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-purple-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
          <IoTimeOutline className="text-purple-400" />
          {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </motion.div>

      {/*Stat cards*/}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          icon={IoChatbubbleEllipsesOutline}
          label="Channels"
          value={totalChannels}
          sub="you're a member of"
          color="#7c3aed"
          delay={0}
        />
        <StatCard
          icon={IoBarChartOutline}
          label="Total Messages"
          value={totalMessages}
          sub="across all channels"
          color="#0891b2"
          delay={0.08}
        />
        <StatCard
          icon={IoPeopleOutline}
          label="Members"
          value={allParticipants}
          sub="unique participants"
          color="#059669"
          delay={0.16}
        />
        <StatCard
          icon={IoFlashOutline}
          label="Most Active"
          value={mostActive?.count ?? 0}
          sub={mostActive ? `in #${mostActive.name}` : 'no activity yet'}
          color="#d97706"
          delay={0.24}
        />
      </motion.div>

      {/* Main Content Grid*/}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Channel Activity Chart (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <IoTrendingUpOutline className="text-purple-500 text-base" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Channel Activity</h2>
              <p className="text-xs text-gray-400">messages per channel</p>
            </div>
          </div>

          {channelActivity.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
              <IoBarChartOutline className="text-4xl text-purple-200" />
              <p className="text-sm">No channel activity yet</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {channelActivity.map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-500">
                    {ch.name}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-purple-50 h-7">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((ch.count / maxCount) * 100, 3)}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                      className="h-7 rounded-full flex items-center justify-end pr-2.5"
                      style={{
                        background: `linear-gradient(90deg, #7c3aed, #a855f7)`,
                        opacity:    Math.max(1 - i * 0.08, 0.4),
                      }}
                    >
                      {ch.count > 0 && (
                        <span className="text-[10px] font-bold text-white">{ch.count}</span>
                      )}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <IoFlashOutline className="text-purple-500 text-base" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Quick Actions</h2>
              <p className="text-xs text-gray-400">manage your account</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <QuickAction
              icon={IoPersonOutline}
              label="Edit Profile"
              desc="Update name & avatar"
              color="#7c3aed"
              onClick={() => navigate('/update-data')}
            />
            <QuickAction
              icon={IoLockClosedOutline}
              label="Change Password"
              desc="Update your password"
              color="#0891b2"
              onClick={() => navigate('/update-password')}
            />
            <QuickAction
              icon={IoChatbubbleEllipsesOutline}
              label="Go to Channels"
              desc="View all your channels"
              color="#059669"
              onClick={() => navigate('/channels')}
            />
          </div>
        </motion.div>
      </div>

      {/*Recently Active Channels*/}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <IoCheckmarkCircleOutline className="text-purple-500 text-base" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Recently Active Channels</h2>
              <p className="text-xs text-gray-400">sorted by latest activity</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/channels')}
            className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
          >
            View all <IoArrowForwardOutline />
          </button>
        </div>

        {recentChannels.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            No channels yet
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="divide-y divide-purple-50"
          >
            {recentChannels.map((ch) => {
              const msgCount = (byChannel[ch._id] || []).filter((m) => !m.isDeleted).length
              const lastMsg  = ch.lastMessage
              const chColor  = getAvatarColor(ch._id)

              return (
                <motion.div
                  key={ch._id}
                  variants={fadeUp}
                  whileHover={{ x: 4, backgroundColor: '#faf5ff' }}
                  onClick={() => navigate('/channels')}
                  className="flex cursor-pointer items-center gap-3 py-3 rounded-xl px-2 transition-colors"
                >
                  {/* channel avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
                    style={{ background: ch.avatar ? undefined : chColor }}
                  >
                    {ch.avatar
                      ? <img src={ch.avatar} alt={ch.name} className="h-full w-full object-cover" />
                      : getInitial(ch.name || 'D')
                    }
                  </div>

                  {/* channel info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {ch.name || 'Direct Chat'}
                      </p>
                      <span className="ml-2 shrink-0 text-[10px] text-gray-400">
                        {formatTime(ch.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {lastMsg?.isDeleted
                        ? 'Message deleted'
                        : lastMsg?.content || 'No messages yet'
                      }
                    </p>
                  </div>

                  {/* message count badge */}
                  {msgCount > 0 && (
                    <span className="ml-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-purple-100 px-1.5 text-[10px] font-bold text-purple-700">
                      {msgCount}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard