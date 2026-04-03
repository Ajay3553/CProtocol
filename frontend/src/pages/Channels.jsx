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
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import apiClient from '../utils/apiClient'
import { fetchUserChannels, setActiveChannel } from '../store/channelSlice'
import { fetchMessages, addIncomingMessage, updateMessage, softDeleteMessage } from '../store/messageSlice'

// Matches roleHierarchy from your message controller
const ROLE_HIERARCHY = { Observer: 1, Agent: 2, Operations: 3, Admin: 4 }
const ROLES = ['Observer', 'Agent', 'Operations', 'Admin']

// Allowed channel role updates from your channel controller
const CHANNEL_ROLES = ['Agent', 'Operations', 'Observer']

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

const groupByDate = (messages) => {
  const result = []
  let lastLabel = null

  for (const msg of messages) {
    const label = formatDateLabel(msg.createdAt)
    if (label !== lastLabel) {
      result.push({ type: 'divider', label })
      lastLabel = label
    }
    result.push({ type: 'message', data: msg })
  }

  return result
}

const Avatar = ({ src, name, size = 'h-10 w-10' }) => {
  return src ? (
    <img src={src} alt={name || 'user'} className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`${size} shrink-0 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm`}>
      {getInitial(name)}
    </div>
  )
}

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-purple-50 ${className}`} />
)

function Channels() {
  const dispatch = useDispatch()
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

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

  const [showMembers, setShowMembers] = useState(false)
  const [addUserId, setAddUserId] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  const activeMessages = useMemo(() => {
    if (!activeChannel?._id) return []
    return byChannel[activeChannel._id] || []
  }, [activeChannel, byChannel])

  const groupedMessages = useMemo(() => groupByDate(activeMessages), [activeMessages])

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) =>
      (channel?.name || 'Direct Chat').toLowerCase().includes(searchTerm.toLowerCase())
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

  useEffect(() => {
    dispatch(fetchUserChannels())
  }, [dispatch])

  useEffect(() => {
    if (activeChannel?._id) {
      dispatch(fetchMessages(activeChannel._id))
    }
    setShowMembers(false)
    setEditingId(null)
    setTtlId(null)
  }, [dispatch, activeChannel?._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length])

  const handleSelectChannel = useCallback((channel) => {
    dispatch(setActiveChannel(channel))
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
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

      const newMessage = res?.data?.data
      if (newMessage) {
        dispatch(addIncomingMessage({
          ...newMessage,
          sender: {
            _id: user?._id,
            username: user?.username,
            fullName: user?.fullName,
            avatar: user?.avatar,
          },
        }))
        dispatch(fetchUserChannels())
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
      const res = await apiClient.patch(`/api/messages/edit/${messageId}`, {
        content: trimmed,
      })

      dispatch(updateMessage(res.data.data))
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
    if (!window.confirm('Delete this message? It will be permanently removed in 24 hours.')) return

    try {
      await apiClient.delete(`/api/messages/delete/${messageId}`)
      dispatch(softDeleteMessage(messageId))
      toast.success('Message deleted')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete message')
    }
  }

  const handleTTLUpdate = async (messageId) => {
    setTtlSaving(true)
    const mins = ttlMinutes === '' || ttlMinutes === '0' ? 0 : parseInt(ttlMinutes)

    try {
      const res = await apiClient.patch(`/api/messages/ttl/${messageId}`, {
        ttlMinutes: isNaN(mins) ? 0 : mins,
      })

      dispatch(updateMessage(res.data.data))
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
    if (!newName.trim()) {
      toast.error('Channel name is required')
      return
    }

    if (newType === 'direct' && !newParticipantId.trim()) {
      toast.error('Direct channel requires exactly 1 participant ID')
      return
    }

    setCreating(true)
    try {
      await apiClient.post('/api/channels/create', {
        name: newName.trim(),
        type: newType,
        participants: newParticipantId.trim() ? [newParticipantId.trim()] : [],
      })

      toast.success('Channel created successfully')
      setNewName('')
      setNewParticipantId('')
      setNewType('group')
      setShowCreateModal(false)
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  const handleAddParticipant = async () => {
    if (!addUserId.trim()) {
      toast.error('User ID is required')
      return
    }

    setAddingUser(true)
    try {
      await apiClient.post(`/api/channels/${activeChannel._id}/add`, {
        userId: addUserId.trim(),
      })

      toast.success('Participant added')
      setAddUserId('')
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add participant')
    } finally {
      setAddingUser(false)
    }
  }

  const handleRemoveParticipant = async (userId) => {
    if (!window.confirm('Remove this participant?')) return

    try {
      await apiClient.post(`/api/channels/${activeChannel._id}/remove`, {
        userId,
      })

      toast.success('Participant removed')
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove participant')
    }
  }

  const handleUpdateParticipantRole = async (userId, role) => {
    try {
      await apiClient.patch(`/api/channels/${activeChannel._id}/role`, {
        userId,
        role,
      })

      toast.success(`Role updated to ${role}`)
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeleteChannel = async () => {
    if (!window.confirm(`Delete "${activeChannel?.name}" permanently?`)) return

    try {
      await apiClient.delete(`/api/channels/${activeChannel._id}/delete`)
      toast.success('Channel deleted')
      dispatch(setActiveChannel(null))
      dispatch(fetchUserChannels())
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete channel')
    }
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden bg-gray-50">
      <div className="relative flex h-full w-full">

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-10 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

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
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                    >
                      <IoAddOutline className="text-lg" />
                    </button>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700"
                    >
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
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
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
                        className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                          isActive
                            ? 'border border-purple-200 bg-purple-100'
                            : 'border border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white ${
                          isActive ? 'bg-purple-700' : 'bg-purple-500'
                        }`}>
                          {getInitial(channel?.name || 'D')}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`truncate text-sm font-semibold ${
                              isActive ? 'text-purple-800' : 'text-gray-800'
                            }`}>
                              {channel?.name || 'Direct Chat'}
                            </span>
                            <span className="shrink-0 text-[10px] text-gray-400">
                              {formatTime(channel?.updatedAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {channel?.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              <div className="shrink-0 border-t border-purple-100 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={user?.avatar} name={user?.username} size="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-xs text-purple-500">{user?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 flex items-center justify-between border-b border-purple-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700"
              >
                <IoMenuOutline className="text-xl" />
              </button>

              {activeChannel ? (
                <>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                    {getInitial(activeChannel?.name || 'D')}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-gray-800">
                      {activeChannel?.name || 'Direct Chat'}
                    </h2>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeChannel?.type} · {activeChannel?.participants?.length || 0} members · You are{' '}
                      <span className="font-medium text-purple-600">{myRole}</span>
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
                  onClick={() => setShowMembers(!showMembers)}
                  className={`rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700 ${
                    showMembers ? 'bg-purple-100 text-purple-700' : ''
                  }`}
                >
                  <IoPeopleOutline className="text-xl" />
                </button>

                {isAdmin && (
                  <button
                    onClick={handleDeleteChannel}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <IoTrashOutline className="text-xl" />
                  </button>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showMembers && activeChannel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 overflow-hidden border-b border-purple-100 bg-purple-50"
              >
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      Members ({activeChannel?.participants?.length || 0})
                    </p>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="username to add"
                          value={addUserId}
                          onChange={(e) => setAddUserId(e.target.value)}
                          className="w-44 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                        <button
                          onClick={handleAddParticipant}
                          disabled={addingUser}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                        >
                          <IoPersonAddOutline className="text-sm" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeChannel.participants?.map((participant) => {
                      const participantUser = participant.user
                      const participantId = (participantUser?._id || participantUser)?.toString()
                      const participantName =
                        participantUser?.username ||
                        participantUser?.fullName ||
                        participantId?.slice(-6)

                      const isMe = participantId === user?._id?.toString()

                      return (
                        <div
                          key={participantId}
                          className="flex items-center gap-2 rounded-full border border-purple-200 bg-white py-1.5 pl-1.5 pr-3"
                        >
                          <Avatar src={participantUser?.avatar} name={participantName} size="h-6 w-6" />
                          <span className="max-w-[80px] truncate text-xs font-medium text-gray-700">
                            {participantName}
                          </span>

                          {isAdmin && !isMe ? (
                            <select
                              value={participant.channelRole}
                              onChange={(e) =>
                                handleUpdateParticipantRole(participantId, e.target.value)
                              }
                              className="cursor-pointer rounded-lg border border-purple-100 bg-purple-50 px-1 py-0.5 text-[10px] font-semibold text-purple-700 outline-none"
                            >
                              {CHANNEL_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                              {participant.channelRole}
                            </span>
                          )}

                          {isAdmin && !isMe && (
                            <button
                              onClick={() => handleRemoveParticipant(participantId)}
                              className="text-gray-300 hover:text-red-500"
                            >
                              <IoClose className="text-sm" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            {!activeChannel ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-100">
                  <IoChatbubbleEllipsesOutline className="text-4xl text-purple-500" />
                </div>
                <h3 className="mb-1 text-xl font-bold text-gray-700">Welcome to CProtocol</h3>
                <p className="max-w-xs text-sm text-gray-400">
                  Select a channel from the sidebar or create a new one to start messaging.
                </p>
              </div>
            ) : messageLoading ? (
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((item) => (
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
                        <span className="rounded-full border border-purple-100 bg-white px-3 py-0.5 text-[11px] font-medium text-purple-400">
                          {item.label}
                        </span>
                        <div className="h-px flex-1 bg-purple-100" />
                      </div>
                    )
                  }

                  const message = item.data
                  const isOwnMessage = message?.sender?._id?.toString() === user?._id?.toString()
                  const isEditing = editingId === message._id
                  const isTTLPanelOpen = ttlId === message._id

                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`group flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="mb-1">
                        <Avatar
                          src={message?.sender?.avatar}
                          name={message?.sender?.username}
                          size="h-8 w-8"
                        />
                      </div>

                      <div className={`flex max-w-[70%] flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {!isOwnMessage && (
                          <span className="ml-1 text-xs font-medium text-purple-600">
                            {message?.sender?.fullName || message?.sender?.username}
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
                                if (e.key === 'Escape') {
                                  setEditingId(null)
                                  setEditContent('')
                                }
                              }}
                              className="min-w-[200px] rounded-xl border border-purple-400 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                            />
                            <button
                              onClick={() => handleEditMessage(message._id)}
                              disabled={editSaving}
                              className="text-green-500 hover:text-green-700 disabled:opacity-50"
                            >
                              <IoCheckmarkOutline className="text-lg" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditContent('')
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <IoClose className="text-lg" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                              message?.isDeleted
                                ? 'bg-gray-100 text-gray-400 italic border border-gray-200'
                                : isOwnMessage
                                ? 'bg-purple-600 text-white rounded-br-sm'
                                : 'border border-purple-100 bg-white text-gray-800 rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {message?.isDeleted ? 'This message was deleted.' : message?.content}
                            </p>

                            <div
                              className={`mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] ${
                                isOwnMessage ? 'text-purple-200 justify-end' : 'text-gray-400'
                              }`}
                            >
                              <span>{formatTime(message?.createdAt)}</span>
                              {message?.isEdited && !message?.isDeleted && <span>· edited</span>}

                              {message?.minVisibilityRole && message.minVisibilityRole !== 'Observer' && (
                                <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5 py-0.5">
                                  <IoLockClosedOutline className="text-[9px]" />
                                  {message.minVisibilityRole}+
                                </span>
                              )}

                              {message?.expiresAt && !message?.isDeleted && (
                                <span
                                  className="flex items-center gap-0.5"
                                  title={`Expires: ${new Date(message.expiresAt).toLocaleString()}`}
                                >
                                  <IoTimerOutline className="text-[10px]" />
                                  TTL
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
                            <button
                              onClick={() => handleTTLUpdate(message._id)}
                              disabled={ttlSaving}
                              className="text-xs font-semibold text-amber-600 hover:text-amber-800 disabled:opacity-50"
                            >
                              Set
                            </button>
                            <button
                              onClick={() => {
                                setTtlId(null)
                                setTtlMinutes('')
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <IoClose className="text-sm" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isOwnMessage && !message?.isDeleted && !isEditing && (
                        <div className="mb-1 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingId(message._id)
                              setEditContent(message.content)
                              setTtlId(null)
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-100 hover:text-purple-700"
                          >
                            <IoPencilOutline className="text-sm" />
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          >
                            <IoTrashOutline className="text-sm" />
                          </button>

                          <button
                            onClick={() => {
                              setTtlId(ttlId === message._id ? null : message._id)
                              setTtlMinutes('')
                              setEditingId(null)
                            }}
                            className={`rounded-lg p-1.5 text-gray-400 hover:bg-amber-100 hover:text-amber-600 ${
                              isTTLPanelOpen ? 'bg-amber-100 text-amber-600' : ''
                            }`}
                          >
                            <IoTimerOutline className="text-sm" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

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
                            onClick={() => {
                              setMinVisibilityRole(role)
                              setShowRoleDropdown(false)
                            }}
                            className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-purple-50 ${
                              minVisibilityRole === role
                                ? 'bg-purple-100 font-bold text-purple-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                        <div className="border-t border-purple-50 px-4 py-2 text-[10px] text-gray-400">
                          Who can see this message
                        </div>
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
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message… Enter to send · Shift+Enter for newline"
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <IoSend className="text-lg" />
                  )}
                </button>
              </div>

              <p className="mt-1.5 pl-1 text-[11px] text-gray-400">
                Visible to <span className="font-semibold text-purple-500">{minVisibilityRole}</span> and above · role level {ROLE_HIERARCHY[minVisibilityRole]}+
              </p>
            </div>
          )}
        </main>

        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
                    >
                      <IoClose className="text-xl" />
                    </button>
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
                        Participant User ID {newType === 'direct' ? '*' : '(optional)'}
                      </label>
                      <input
                        type="text"
                        value={newParticipantId}
                        onChange={(e) => setNewParticipantId(e.target.value)}
                        placeholder="username"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        {newType === 'direct'
                          ? 'Required — direct channel needs exactly 1 participant'
                          : 'Optional for group channel'}
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
      </div>
    </div>
  )
}

export default Channels