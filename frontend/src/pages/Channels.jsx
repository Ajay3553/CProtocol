import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IoSend,
  IoChatbubbleEllipsesOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoAddOutline,
  IoMenuOutline,
  IoClose,
  IoPencilOutline,
  IoTrashOutline,
  IoTimerOutline,
  IoPersonAddOutline,
  IoCheckmarkOutline,
  IoChevronDownOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoSettingsOutline,
  IoCameraOutline,
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import apiClient from '../utils/apiClient'
import socket from '../utils/socketClient'
import {
  fetchUserChannels,
  setActiveChannel,
  upsertChannel,
  removeChannel,
  updateLastMessage,
} from '../store/channelSlice'
import { fetchMessages, addIncomingMessage, updateMessage, softDeleteMessage } from '../store/messageSlice'

// Constants
const ROLE_HIERARCHY = { Observer: 1, Agent: 2, Operations: 3, Admin: 4 }
const ROLES = ['Observer', 'Agent', 'Operations', 'Admin']

const ROLE_STYLES = {
  Admin:      { color: '#7c3aed', bg: '#ede9fe' },
  Operations: { color: '#0891b2', bg: '#e0f7fa' },
  Agent:      { color: '#059669', bg: '#d1fae5' },
  Observer:   { color: '#d97706', bg: '#fef3c7' },
}

const AVATAR_COLORS = [
  '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#db2777', '#ea580c', '#4f46e5', '#0d9488',
]

// Helpers
const getInitial = (str) => str?.charAt(0)?.toUpperCase() || '?'

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDateLabel = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const getAvatarColor = (id) => {
  if (!id) return AVATAR_COLORS[0]
  const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const groupByDate = (messages) => {
  const result = []
  let lastLabel = null
  for (const msg of messages) {
    if (msg.isDeleted) continue
    const label = formatDateLabel(msg.createdAt)
    if (label !== lastLabel) {
      result.push({ type: 'divider', label })
      lastLabel = label
    }
    result.push({ type: 'message', data: msg })
  }
  return result
}

const normalizeChannelId = (channel) =>
  typeof channel === 'object' && channel !== null ? channel._id?.toString() : channel?.toString()

// Sub-components
const Avatar = ({ src, name, size = 'h-10 w-10', color }) => {
  if (src) return <img src={src} alt={name || 'user'} className={`${size} shrink-0 rounded-full object-cover`} />
  return (
    <div
      className={`${size} shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-sm`}
      style={{ background: color || '#7c3aed' }}
    >
      {getInitial(name)}
    </div>
  )
}

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-purple-50 ${className}`} />
)

const RoleBadge = ({ role, className = '' }) => {
  const style = ROLE_STYLES[role] || ROLE_STYLES.Observer
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${className}`}
      style={{ color: style.color, background: style.bg }}
    >
      {role}
    </span>
  )
}

// ChannelSettingsModal
function ChannelSettingsModal({ channel, myRole, onClose, onUpdated, onDeleted }) {
  const canDelete = myRole === 'Admin'
  const [name, setName] = useState(channel?.name || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(channel?.avatar || null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef()

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Channel name is required'); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      if (avatarFile) formData.append('avatar', avatarFile)
      const res = await apiClient.patch(`/api/channels/${channel._id}/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Channel updated')
      onUpdated(res.data.data)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update channel')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.delete(`/api/channels/${channel._id}/delete`)
      toast.success('Channel deleted')
      onDeleted()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete channel')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-purple-100"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <IoSettingsOutline className="text-purple-600 text-lg" />
            <h3 className="text-base font-bold text-gray-800">Channel Settings</h3>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <IoClose />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Role badge */}
          <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2">
            <IoShieldOutline className="text-purple-500 text-sm" />
            <span className="text-xs text-purple-600 font-semibold">
              {myRole === 'Admin' ? 'Admin — Full access' : 'Operations — Can edit name & icon'}
            </span>
          </div>

          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white cursor-pointer overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  : getInitial(name || channel?.name)
                }
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700"
              >
                <IoCameraOutline className="text-sm" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-xs text-gray-400">Click to change group photo</p>
          </div>

          {/* Name input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          {/* Admin only */}
          {canDelete && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400">Danger Zone</p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <IoTrashOutline />Delete Channel Permanently
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-3 text-sm text-red-700">
                      Permanently delete <strong>{channel?.name}</strong>? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                      <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                        {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// MemberDetailModal
function MemberDetailModal({ member, myRole, channelId, onClose, onRoleChange, onRemove }) {
  const [updatingRole, setUpdatingRole] = useState(false)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [currentRole, setCurrentRole] = useState(member?.channelRole || 'Observer')

  const canManage = ROLE_HIERARCHY[myRole] >= 3
  const isMe = member?.isMe
  const participantId = (member?.user?._id || member?.user)?.toString()
  const participantUser = member?.user
  const name = participantUser?.fullName || participantUser?.username || participantId?.slice(-6) || '—'
  const username = participantUser?.username || '—'
  const email = participantUser?.email || '—'
  const avatarColor = getAvatarColor(participantId)

  const handleRoleChange = async (newRole) => {
    if (newRole === currentRole) return
    setUpdatingRole(true)
    try {
      await apiClient.patch(`/api/channels/${channelId}/role`, { userId: participantId, role: newRole })
      toast.success(`Role updated to ${newRole}`)
      setSuccessMsg(`Role changed to ${newRole}`)
      setCurrentRole(newRole)
      setTimeout(() => setSuccessMsg(''), 3000)
      onRoleChange(participantId, newRole)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update role')
    } finally {
      setUpdatingRole(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      await apiClient.post(`/api/channels/${channelId}/remove`, { userId: participantId })
      toast.success(`${name} removed from channel`)
      onRemove(participantId)
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove participant')
    } finally {
      setRemoving(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    toast.success(`Copied ${label}`)
  }

  const allowedRoles = myRole === 'Admin' ? ['Observer', 'Agent', 'Operations', 'Admin'] : ['Observer', 'Agent']

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl border border-purple-100"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-20" style={{ background: `linear-gradient(135deg, ${avatarColor}dd, ${avatarColor}88)` }}>
            <button onClick={onClose} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35">
              <IoClose className="text-lg" />
            </button>
          </div>
          <div className="relative px-6 pb-6">
            <div className="absolute -top-7 left-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white text-xl font-bold text-white shadow-lg" style={{ background: avatarColor }}>
                {participantUser?.avatar
                  ? <img src={participantUser.avatar} alt={name} className="h-full w-full rounded-full object-cover" />
                  : getInitial(name)
                }
              </div>
            </div>
            <div className="pt-10">
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                  >
                    <IoCheckmarkOutline className="shrink-0" />{successMsg}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {name}{isMe && <span className="ml-1.5 text-xs font-normal text-gray-400">(You)</span>}
                </h3>
              </div>
              <div className="mb-5 flex items-center gap-2">
                <RoleBadge role={currentRole} />
                <span className="text-xs text-gray-400">in this channel</span>
              </div>
              <div className="mb-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <IoPersonOutline className="shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Username</p>
                    <p className="text-sm font-medium text-gray-800">@{username}</p>
                  </div>
                  <button onClick={() => copyToClipboard('@' + username, 'username')} className="shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-purple-100 hover:text-purple-600">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <IoPersonOutline className="shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-800">{participantUser?.fullName || '—'}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <IoMailOutline className="shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Email Address</p>
                      <p className="truncate text-sm font-medium text-gray-800">{email}</p>
                    </div>
                    <button onClick={() => copyToClipboard(email, 'email')} className="shrink-0 rounded-lg p-1.5 text-gray-300 hover:bg-purple-100 hover:text-purple-600">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                  <IoShieldCheckmarkOutline className="shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">System Role</p>
                    <p className="text-sm font-medium text-gray-800">{participantUser?.role || '—'}</p>
                  </div>
                </div>
              </div>
              {canManage && !isMe && (
                <>
                  <div className="mb-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Change Channel Role</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allowedRoles.map((r) => {
                        const s = ROLE_STYLES[r]
                        const isSelected = currentRole === r
                        return (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(r)}
                            disabled={updatingRole}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${isSelected ? 'border-transparent' : 'border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-700'} disabled:opacity-50`}
                            style={isSelected ? { color: s.color, background: s.bg, borderColor: s.color } : {}}
                          >
                            {isSelected && updatingRole ? '…' : r}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="h-px bg-purple-50 mb-4" />
                  {!showConfirmRemove ? (
                    <button
                      onClick={() => setShowConfirmRemove(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <IoPersonAddOutline className="rotate-180 text-base" />Remove from Channel
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="mb-3 text-sm font-medium text-red-700">Remove <strong>{name}</strong> from this channel?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowConfirmRemove(false)} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button onClick={handleRemove} disabled={removing} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                          {removing ? 'Removing…' : 'Confirm Remove'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// MembersPanel
function MembersPanel({ activeChannel, myRole, user, onClose, onRoleChange, onRemove, onMemberAdded }) {
  const [addUserId, setAddUserId] = useState('')
  const [addingUser, setAddingUser] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const canManage = ROLE_HIERARCHY[myRole] >= 3

  const grouped = useMemo(() => {
    const order = ['Admin', 'Operations', 'Agent', 'Observer']
    const g = {}
    order.forEach((r) => (g[r] = []))
    activeChannel?.participants?.forEach((p) => {
      const r = p.channelRole || 'Observer'
      if (g[r]) g[r].push(p)
      else g['Observer'].push(p)
    })
    return order.map((r) => ({ role: r, members: g[r] })).filter((g) => g.members.length > 0)
  }, [activeChannel?.participants])

  const handleAddParticipant = async () => {
    if (!addUserId.trim()) { toast.error('Username is required'); return }
    setAddingUser(true)
    try {
      await apiClient.post(`/api/channels/${activeChannel._id}/add`, { username: addUserId.trim() })
      toast.success('Participant added')
      setAddUserId('')
      onMemberAdded()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add participant')
    } finally {
      setAddingUser(false)
    }
  }

  return (
    <>
      <motion.aside
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="flex h-full w-[280px] flex-shrink-0 flex-col border-l border-purple-100 bg-white"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-purple-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">Group Details</span>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
              {activeChannel?.participants?.length || 0}
            </span>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
            <IoClose />
          </button>
        </div>
        {canManage && (
          <div className="shrink-0 border-b border-purple-50 bg-purple-50/50 px-4 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-500">Add Member</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                className="min-w-0 flex-1 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />
              <button
                onClick={handleAddParticipant}
                disabled={addingUser || !addUserId.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {addingUser
                  ? <div className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
                  : <IoPersonAddOutline className="text-sm" />
                }
              </button>
            </div>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          {grouped.map(({ role, members }) => {
            const s = ROLE_STYLES[role]
            return (
              <div key={role} className="mb-4 px-3">
                <div className="mb-1.5 flex items-center gap-2 px-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{role} · {members.length}</span>
                </div>
                {members.map((participant) => {
                  const pUser = participant.user
                  const pId = (pUser?._id || pUser)?.toString()
                  const pName = pUser?.fullName || pUser?.username || pId?.slice(-6)
                  const isMe = pId === user?._id?.toString()
                  const avatarColor = getAvatarColor(pId)
                  return (
                    <button
                      key={pId}
                      onClick={() => setSelectedMember({ ...participant, isMe })}
                      className="mb-0.5 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-purple-50 active:bg-purple-100"
                    >
                      <div className="relative shrink-0">
                        {pUser?.avatar
                          ? <img src={pUser.avatar} alt={pName} className="h-8 w-8 rounded-full object-cover" />
                          : <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: avatarColor }}>{getInitial(pName)}</div>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="truncate text-xs font-semibold text-gray-800">{pName}</span>
                          {isMe && <span className="shrink-0 text-[10px] text-gray-400">(You)</span>}
                        </div>
                        <span className="text-[10px] text-gray-400">@{pUser?.username || '—'}</span>
                      </div>
                      <IoChevronForwardOutline className="shrink-0 text-gray-300 text-sm" />
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </motion.aside>
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            myRole={myRole}
            channelId={activeChannel._id}
            onClose={() => setSelectedMember(null)}
            onRoleChange={(participantId, newRole) => {
              onRoleChange(participantId, newRole)
              setSelectedMember(null)
            }}
            onRemove={(participantId) => {
              onRemove(participantId)
              setSelectedMember(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Main Channels Component
function Channels() {
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const activeChannelRef = useRef(null)
  const userRef = useRef(null)

  const { channels = [], activeChannel, isLoading: channelLoading } = useSelector((s) => s.channels)
  const { byChannel = {}, isLoading: messageLoading } = useSelector((s) => s.messages)
  const { userData: user } = useSelector((s) => s.auth)

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageText, setMessageText] = useState('')
  const [minVisibilityRole, setMinVisibilityRole] = useState('Observer')
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [ttlId, setTtlId] = useState(null)
  const [ttlMinutes, setTtlMinutes] = useState('')
  const [ttlSaving, setTtlSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('group')
  const [newParticipantId, setNewParticipantId] = useState('')
  const [creating, setCreating] = useState(false)
  const [showMembersPanel, setShowMembersPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Keep refs in sync so all socket callbacks always have latest values
  useEffect(() => { activeChannelRef.current = activeChannel }, [activeChannel])
  useEffect(() => { userRef.current = user }, [user])

  const activeMessages = useMemo(() => {
    if (!activeChannel?._id) return []
    return byChannel[activeChannel._id] || []
  }, [activeChannel, byChannel])


  const filteredChannels = useMemo(() => {
    return channels.filter((ch) =>
      (ch?.name || 'Direct Chat').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [channels, searchTerm])

  const myRole = useMemo(() => {
    if (!activeChannel || !user) return 'Agent'
    const me = activeChannel.participants?.find(
      (p) => (p.user?._id || p.user)?.toString() === user?._id?.toString()
    )
    return me?.channelRole || 'Agent'
  }, [activeChannel, user])

  const isAdmin = myRole === 'Admin'
  const groupedMessages = useMemo(() => groupByDate(activeMessages), [activeMessages])

  // Fetch channels on mount
  useEffect(() => { dispatch(fetchUserChannels()) }, [dispatch])

  // Fetch messages + join socket room when channel changes
  useEffect(() => {
    if (!activeChannel?._id) return
    dispatch(fetchMessages(activeChannel._id))
    setShowMembersPanel(false)
    setEditingId(null)
    setTtlId(null)
    socket.emit('join_channel', activeChannel._id)

    return () => {
      socket.emit('leave_channel', activeChannel._id)
    }
  }, [dispatch, activeChannel?._id])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length])

  // Socket setup
  useEffect(() => {
    if (!user?._id) return

    if (socket.disconnected) {
      socket.connect()
      console.log("Socket is connecting...")
    }

    const handleSetup = () => {
      console.log("Socket setup running")
      socket.emit('register_user')
      if (activeChannelRef.current?._id) {
        socket.emit('join_channel', activeChannelRef.current._id)
      }
    }

    if (socket.connected) {
      handleSetup()
    }
    socket.on('connect', handleSetup)

    socket.on('receive_message', (msg) => {
      const senderId = (msg?.sender?._id || msg?.sender)?.toString()
      const currentUserId = userRef.current?._id?.toString()
      if (senderId && currentUserId && senderId === currentUserId) return
      const channelId = normalizeChannelId(msg?.channel)
      const normalizedMsg = { ...msg, channel: channelId }
      dispatch(addIncomingMessage(normalizedMsg))
      if (channelId) dispatch(updateLastMessage({ channelId, message: normalizedMsg }))
    })

    socket.on('message:updated', (msg) => {
      if (!msg) return
      const channelId = normalizeChannelId(msg?.channel)
      dispatch(updateMessage({ ...msg, channel: channelId }))
    })

    socket.on('message:deleted', (msg) => {
      if (!msg) return
      const messageId = msg._id || msg
      const channelId = msg.channel

      dispatch(softDeleteMessage(messageId))

      if (channelId) {
        dispatch(updateLastMessage({
          channelId,
          message: { _id: messageId, isDeleted: true, content: '' }
        }))
      }
    })

    socket.on('channel:updated', (updated) => {
      dispatch(upsertChannel(updated))
      if (updated._id?.toString() === activeChannelRef.current?._id?.toString()) {
        dispatch(setActiveChannel(updated))
      }
    })

    socket.on('channel:created', (created) => dispatch(upsertChannel(created)))

    socket.on('channel:removed', ({ channelId }) => {
      dispatch(removeChannel({ channelId }))
      toast.info('You were removed from a channel or it was deleted.')
    })

    return () => {
      console.log("Cleaning up socket listeners (leaving socket connected)")
      socket.off('connect', handleSetup)
      socket.off('receive_message')
      socket.off('message:updated')
      socket.off('message:deleted')
      socket.off('channel:updated')
      socket.off('channel:created')
      socket.off('channel:removed')
    }
  }, [user?._id, dispatch])

  // Optimistic role change
  const handleMemberRoleChange = useCallback((participantId, newRole) => {
    const ch = activeChannelRef.current
    if (!ch) return
    const updatedParticipants = ch.participants.map((p) => {
      const pId = (p.user?._id || p.user)?.toString()
      return pId === participantId ? { ...p, channelRole: newRole } : p
    })
    const updatedChannel = { ...ch, participants: updatedParticipants }
    dispatch(setActiveChannel(updatedChannel))
    dispatch(upsertChannel(updatedChannel))
  }, [dispatch])

  // Optimistic remove
  const handleMemberRemove = useCallback((participantId) => {
    const ch = activeChannelRef.current
    if (!ch) return
    const updatedParticipants = ch.participants.filter((p) => {
      const pId = (p.user?._id || p.user)?.toString()
      return pId !== participantId
    })
    const updatedChannel = { ...ch, participants: updatedParticipants }
    dispatch(setActiveChannel(updatedChannel))
    dispatch(upsertChannel(updatedChannel))
  }, [dispatch])

  // Add member
  const handleMemberAdded = useCallback(async () => {
    const result = await dispatch(fetchUserChannels())
    const freshChannels = result?.payload
    if (Array.isArray(freshChannels) && activeChannelRef.current?._id) {
      const updated = freshChannels.find(
        (ch) => ch._id?.toString() === activeChannelRef.current._id?.toString()
      )
      if (updated) dispatch(setActiveChannel(updated))
    }
  }, [dispatch])

  const handleSelectChannel = useCallback((channel) => {
    dispatch(setActiveChannel(channel))
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }, [dispatch])

  const handleSendMessage = async () => {
    const trimmed = messageText.trim()
    if (!trimmed || !activeChannel?._id || sending) return
    setSending(true)
    try {
      const res = await apiClient.post('/api/messages/send', {
        channelId: activeChannel._id,
        content: trimmed,
        minVisibilityRole,
      })
      const newMsg = res?.data?.data
      if (newMsg) {
        dispatch(addIncomingMessage({
          ...newMsg,
          channel: activeChannel._id,
          sender: {
            _id: user?._id,
            username: user?.username,
            fullName: user?.fullName,
            avatar: user?.avatar,
          },
        }))
        dispatch(updateLastMessage({ channelId: activeChannel._id, message: newMsg }))
      }
      setMessageText('')
      textareaRef.current?.focus()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = async (messageId) => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    setEditSaving(true)
    try {
      const res = await apiClient.patch(`/api/messages/edit/${messageId}`, { content: trimmed })
      const originalMsg = activeMessages.find((m) => m._id === messageId)
      const resolvedSender =
        (typeof res.data.data?.sender === 'object' && res.data.data.sender?._id
          ? res.data.data.sender
          : null) ||
        (typeof originalMsg?.sender === 'object' && originalMsg.sender?._id
          ? originalMsg.sender
          : null) ||
        {
          _id: user?._id,
          username: user?.username,
          fullName: user?.fullName,
          avatar: user?.avatar,
        }

      dispatch(updateMessage({
        ...res.data.data,
        channel: normalizeChannelId(res.data.data?.channel) || activeChannel._id,
        sender: resolvedSender,
      }))
      toast.success('Message updated')
      setEditingId(null)
      setEditContent('')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to edit message')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await apiClient.delete(`/api/messages/delete/${messageId}`)
      dispatch(softDeleteMessage(messageId))
      dispatch(updateLastMessage({
        channelId: activeChannel._id,
        message: { _id: messageId, isDeleted: true, content: '' }
      }))

      toast.success('Message deleted')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete message')
    }
  }

  const handleTTLUpdate = async (messageId) => {
    setTtlSaving(true)
    const mins = ttlMinutes === '' || ttlMinutes === '0' ? 0 : parseInt(ttlMinutes)
    try {
      const res = await apiClient.patch(`/api/messages/ttl/${messageId}`, { ttlMinutes: isNaN(mins) ? 0 : mins })
      const originalMsg = activeMessages.find((m) => m._id === messageId)
      dispatch(updateMessage({
        ...res.data.data,
        channel: normalizeChannelId(res.data.data?.channel) || activeChannel._id,
        sender: res.data.data?.sender || originalMsg?.sender,
      }))
      toast.success(mins > 0 ? `TTL set to ${mins} min` : 'TTL removed')
      setTtlId(null)
      setTtlMinutes('')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update TTL')
    } finally {
      setTtlSaving(false)
    }
  }

  const handleCreateChannel = async () => {
    if (!newName.trim()) { toast.error('Channel name is required'); return }
    if (newType === 'direct' && !newParticipantId.trim()) {
      toast.error('Direct channel requires a participant'); return
    }
    setCreating(true)
    try {
      await apiClient.post('/api/channels/create', {
        name: newName.trim(),
        type: newType,
        participants: newParticipantId.trim() ? [newParticipantId.trim()] : [],
      })
      toast.success('Channel created')
      setNewName(''); setNewParticipantId(''); setNewType('group'); setShowCreateModal(false)
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden bg-gray-50">
      <div className="relative flex h-full w-full">

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-10 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* LEFT SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute lg:relative z-20 flex h-full w-[300px] flex-col border-r border-purple-100 bg-white shadow-xl lg:shadow-none"
            >
              <div className="shrink-0 border-b border-purple-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                      <IoChatbubbleEllipsesOutline className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-purple-800">Channels</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowCreateModal(true)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors">
                      <IoAddOutline className="text-lg" />
                    </button>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700">
                      <IoClose className="text-lg" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search channels…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {channelLoading ? (
                  <div className="space-y-2 p-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16" />)}</div>
                ) : filteredChannels.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center px-4 text-center text-gray-400">
                    <IoPeopleOutline className="mb-2 text-4xl text-purple-200" />
                    <p className="text-sm font-medium">No channels yet</p>
                    <p className="mt-0.5 text-xs">Click + to create one</p>
                  </div>
                ) : (
                  filteredChannels.map((channel) => {
                    const isActive = activeChannel?._id === channel._id
                    return (
                      <button
                        key={channel._id}
                        onClick={() => handleSelectChannel(channel)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${isActive ? 'border border-purple-200 bg-purple-100' : 'border border-transparent hover:bg-gray-50'}`}
                      >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white overflow-hidden ${isActive ? 'bg-purple-700' : 'bg-purple-500'}`}>
                          {channel?.avatar
                            ? <img src={channel.avatar} alt={channel.name} className="h-full w-full object-cover" />
                            : getInitial(channel?.name || 'D')
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`truncate text-sm font-semibold ${isActive ? 'text-purple-800' : 'text-gray-800'}`}>
                              {channel?.name || 'Direct Chat'}
                            </span>
                            <span className="shrink-0 text-[10px] text-gray-400">{formatTime(channel?.updatedAt)}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {channel.lastMessage?.isDeleted
                              ? 'Message deleted'
                              : (channel.lastMessage?.content || '')}
                          </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
              <div className="shrink-0 border-t border-purple-100 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={user?.avatar} name={user?.username} size="h-9 w-9" color={getAvatarColor(user?._id)} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">{user?.fullName || user?.username}</p>
                    <p className="text-xs text-purple-500">{user?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CHAT */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="shrink-0 flex items-center justify-between border-b border-purple-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700">
                <IoMenuOutline className="text-xl" />
              </button>
              {activeChannel ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white overflow-hidden">
                    {activeChannel?.avatar
                      ? <img src={activeChannel.avatar} alt={activeChannel.name} className="h-full w-full object-cover" />
                      : getInitial(activeChannel?.name || 'D')
                    }
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-gray-800">{activeChannel?.name || 'Direct Chat'}</h2>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeChannel?.type} · {activeChannel?.participants?.length || 0} Members · You Are{' '}
                      <span className="font-semibold text-purple-600">{myRole}</span>
                    </p>
                  </div>
                </>
              ) : (
                <h2 className="text-base font-bold text-gray-600">Select a channel</h2>
              )}
            </div>
            {activeChannel && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setShowMembersPanel(!showMembersPanel)}
                  className={`rounded-lg p-2 text-gray-500 transition hover:bg-purple-50 hover:text-purple-700 ${showMembersPanel ? 'bg-purple-100 text-purple-700' : ''}`}
                  title="Group Details"
                >
                  <IoPeopleOutline className="text-xl" />
                </button>
                {(isAdmin || myRole === 'Operations') && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-700"
                    title="Channel Settings"
                  >
                    <IoSettingsOutline className="text-xl" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat area + Members panel */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                {!activeChannel ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-100">
                      <IoChatbubbleEllipsesOutline className="text-4xl text-purple-500" />
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-gray-700">Welcome to CProtocol</h3>
                    <p className="max-w-xs text-sm text-gray-400">Select a channel from the sidebar or create a new one to start messaging.</p>
                  </div>
                ) : messageLoading ? (
                  <div className="space-y-5">
                    {[1,2,3,4,5].map((item) => (
                      <div key={item} className={`flex gap-3 ${item % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className={`h-14 ${item % 2 === 0 ? 'w-44' : 'w-56'}`} />
                      </div>
                    ))}
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <IoChatbubbleEllipsesOutline className="mb-3 text-5xl text-purple-200" />
                    <p className="font-semibold text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">Be the first to say something!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {groupedMessages.map((item, idx) => {
                      if (item.type === 'divider') {
                        return (
                          <div key={`div-${idx}`} className="my-4 flex items-center gap-3">
                            <div className="h-px flex-1 bg-purple-100" />
                            <span className="rounded-full border border-purple-100 bg-white px-3 py-0.5 text-[11px] font-medium text-purple-400">{item.label}</span>
                            <div className="h-px flex-1 bg-purple-100" />
                          </div>
                        )
                      }

                      const message = item.data
                      const senderId = (message?.sender?._id || message?.sender)?.toString()
                      const isOwnMessage = !!senderId && senderId === user?._id?.toString()

                      const senderObj = typeof message?.sender === 'object' ? message.sender : null
                      const senderName =
                        senderObj?.fullName ||
                        senderObj?.username ||
                        (isOwnMessage ? (user?.fullName || user?.username) : `User …${senderId?.slice(-4) ?? ''}`)
                      const senderAvatar =
                        senderObj?.avatar ||
                        (isOwnMessage ? user?.avatar : null)

                      const isEditing = editingId === message._id
                      const isTTLPanelOpen = ttlId === message._id

                      return (
                        message.isDeleted ? null : (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`group flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <div className="mb-1">
                              <Avatar
                                src={senderAvatar}
                                name={senderName}
                                size="h-8 w-8"
                                color={getAvatarColor(senderId)}
                              />
                            </div>

                            <div className={`flex max-w-[70%] flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                              {!isOwnMessage && (
                                <span className="ml-1 text-xs font-medium text-purple-600">
                                  {senderName}
                                </span>
                              )}

                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    autoFocus
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditMessage(message._id)
                                      if (e.key === 'Escape') { setEditingId(null); setEditContent('') }
                                    }}
                                    className="min-w-[200px] rounded-xl border border-purple-400 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                                  />
                                  <button onClick={() => handleEditMessage(message._id)} disabled={editSaving} className="text-green-500 hover:text-green-700 disabled:opacity-50">
                                    <IoCheckmarkOutline className="text-lg" />
                                  </button>
                                  <button onClick={() => { setEditingId(null); setEditContent('') }} className="text-gray-400 hover:text-gray-600">
                                    <IoClose className="text-lg" />
                                  </button>
                                </div>
                              ) : (
                                <div className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                                  isOwnMessage
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'border border-purple-100 bg-white text-gray-800 rounded-bl-sm'
                                }`}>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {message?.content}
                                  </p>
                                  <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] ${isOwnMessage ? 'text-purple-200 justify-end' : 'text-gray-400'}`}>
                                    <span>{formatTime(message?.createdAt)}</span>
                                    {message?.isEdited && <span>· edited</span>}
                                    {message?.minVisibilityRole && message.minVisibilityRole !== 'Observer' && (
                                      <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5">
                                        <IoLockClosedOutline className="text-[9px]" />{message.minVisibilityRole}+
                                      </span>
                                    )}
                                    {message?.expiresAt && (
                                      <span className="flex items-center gap-0.5" title={`Expires: ${new Date(message.expiresAt).toLocaleString()}`}>
                                        <IoTimerOutline className="text-[10px]" />TTL
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {isTTLPanelOpen && (
                                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                  <IoTimerOutline className="shrink-0 text-amber-500" />
                                  <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    placeholder="Minutes (0 = remove TTL)"
                                    value={ttlMinutes}
                                    onChange={(e) => setTtlMinutes(e.target.value)}
                                    className="w-44 rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-200"
                                  />
                                  <button onClick={() => handleTTLUpdate(message._id)} disabled={ttlSaving} className="text-xs font-semibold text-amber-600 hover:text-amber-800 disabled:opacity-50">Set</button>
                                  <button onClick={() => { setTtlId(null); setTtlMinutes('') }} className="text-gray-400 hover:text-gray-600">
                                    <IoClose className="text-sm" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {isOwnMessage && !message?.isDeleted && !isEditing && (
                              <div className="mb-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button onClick={() => { setEditingId(message._id); setEditContent(message.content); setTtlId(null) }} className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-100 hover:text-purple-700">
                                  <IoPencilOutline className="text-sm" />
                                </button>
                                <button onClick={() => handleDeleteMessage(message._id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600">
                                  <IoTrashOutline className="text-sm" />
                                </button>
                                <button onClick={() => { setTtlId(ttlId === message._id ? null : message._id); setTtlMinutes(''); setEditingId(null) }} className={`rounded-lg p-1.5 text-gray-400 hover:bg-amber-100 hover:text-amber-600 ${isTTLPanelOpen ? 'bg-amber-100 text-amber-600' : ''}`}>
                                  <IoTimerOutline className="text-sm" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message input */}
              {activeChannel && (
                <div className="shrink-0 border-t border-purple-100 bg-white px-4 py-3">
                  <div className="flex items-end gap-3">
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-3 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        <IoShieldOutline className="text-sm" />
                        {minVisibilityRole}
                        <IoChevronDownOutline className="text-xs" />
                      </button>
                      <AnimatePresence>
                        {showRoleDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="absolute bottom-full left-0 z-10 mb-1 overflow-hidden rounded-xl border border-purple-100 bg-white shadow-xl"
                          >
                            {ROLES.map((role) => (
                              <button
                                key={role}
                                onClick={() => { setMinVisibilityRole(role); setShowRoleDropdown(false) }}
                                className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-purple-50 ${minVisibilityRole === role ? 'bg-purple-100 font-bold text-purple-700' : 'text-gray-700'}`}
                              >
                                {role}
                              </button>
                            ))}
                            <div className="border-t border-purple-50 px-4 py-2 text-[10px] text-gray-400">Who can see this message</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
                      }}
                      placeholder="Type a message… Enter to send · Shift+Enter for newline"
                      className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sending}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        : <IoSend className="text-lg" />
                      }
                    </button>
                  </div>
                  <p className="mt-1.5 pl-1 text-[11px] text-gray-400">
                    Visible to <span className="font-semibold text-purple-500">{minVisibilityRole}</span> and above · role level {ROLE_HIERARCHY[minVisibilityRole]}+
                  </p>
                </div>
              )}
            </div>

            {/* Right Members Panel */}
            <AnimatePresence>
              {showMembersPanel && activeChannel && (
                <MembersPanel
                  activeChannel={activeChannel}
                  myRole={myRole}
                  user={user}
                  onClose={() => setShowMembersPanel(false)}
                  onRoleChange={handleMemberRoleChange}
                  onRemove={handleMemberRemove}
                  onMemberAdded={handleMemberAdded}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Create Channel Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 16 }}
                  className="w-full max-w-sm rounded-2xl border border-purple-100 bg-white p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Create Channel</h3>
                    <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-gray-400 hover:text-gray-700"><IoClose className="text-xl" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Name *</label>
                      <input
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. general, ops-team"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['group', 'direct'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setNewType(type)}
                            className={`rounded-xl border py-2.5 text-sm font-semibold capitalize transition ${
                              newType === type
                                ? 'border-purple-500 bg-purple-600 text-white'
                                : 'border-gray-200 text-gray-600 hover:border-purple-300'
                            }`}
                          >
                            {type === 'group' ? '👥 Group' : '💬 Direct'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        Participant Username {newType === 'direct' ? '*' : '(optional)'}
                      </label>
                      <input
                        type="text"
                        value={newParticipantId}
                        onChange={(e) => setNewParticipantId(e.target.value)}
                        placeholder="username"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        {newType === 'direct' ? 'Required — direct channel needs exactly 1 participant' : 'Optional for group channel'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateChannel}
                    disabled={creating}
                    className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-60"
                  >
                    {creating ? 'Creating…' : 'Create Channel'}
                  </button>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Channel Settings Modal */}
        <AnimatePresence>
          {showSettings && activeChannel && (isAdmin || myRole === 'Operations') && (
            <ChannelSettingsModal
              channel={activeChannel}
              myRole={myRole}
              onClose={() => setShowSettings(false)}
              onUpdated={(updated) => {
                dispatch(upsertChannel(updated))
                dispatch(setActiveChannel(updated))
              }}
              onDeleted={() => {
                dispatch(setActiveChannel(null))
                dispatch(fetchUserChannels())
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default Channels
