import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    IoPersonOutline,
    IoCameraOutline,
    IoCheckmarkOutline,
    IoCloseOutline,
} from 'react-icons/io5'
import { fetchCurrentUser } from '../../store/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const UPDATE_ENDPOINT = `${API_BASE_URL}/api/users/update-data`

const AVATAR_COLORS = ['#7c3aed','#0891b2','#059669','#d97706','#db2777','#ea580c','#4f46e5','#0d9488']

const getInitial = (str) => str?.charAt(0)?.toUpperCase() || '?'

const getAvatarColor = (id) => {
    if (!id) return AVATAR_COLORS[0]
    const hash = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function UpdateUserData() {
    const dispatch = useDispatch()
    const { userData: user } = useSelector((s) => s.auth)

    const fileRef = useRef()

    const [avatarFile, setAvatarFile]       = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [fullName, setFullName]           = useState(user?.fullName || '')
    const [saving, setSaving]               = useState(false)

    // handlers
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB')
            return
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleRemoveAvatarPreview = () => {
        setAvatarFile(null)
        setAvatarPreview(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleSave = async () => {
        if (!fullName.trim()) {
            toast.error('Full name cannot be empty')
            return
        }

        const nameUnchanged = fullName.trim() === (user?.fullName || '').trim()
        const noNewAvatar   = !avatarFile
        if (nameUnchanged && noNewAvatar) {
            toast.info('No changes to save')
            return
        }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('newFullName', fullName.trim())
            if (avatarFile) formData.append('avatar', avatarFile)

            const response = await fetch(UPDATE_ENDPOINT, {
                method: 'PATCH',
                body: formData,
                credentials: 'include',   // sends cookies (accessToken)
            })

            const result = await response.json()

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Failed to update profile')
            }

            toast.success(result.message || 'Profile updated successfully')

            // Re-fetch user so Redux store + UI reflect the new name/avatar
            await dispatch(fetchCurrentUser()).unwrap()

            // clear avatar preview
            setAvatarFile(null)
            setAvatarPreview(null)
            if (fileRef.current) fileRef.current.value = ''

        } catch (err) {
            toast.error(err.message || 'Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const avatarColor   = getAvatarColor(user?._id)
    const displayAvatar = avatarPreview || user?.avatar

    return (
        <div className="min-h-screen bg-purple-50/40 flex items-start justify-center p-4 sm:p-8">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="mt-1 text-sm text-gray-500">Update your name and profile picture.</p>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm space-y-6">

                    {/* Avatar*/}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div
                                className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white shadow-md ring-4 ring-purple-100"
                                style={{ background: displayAvatar ? undefined : avatarColor }}
                                onClick={() => fileRef.current?.click()}
                            >
                                {displayAvatar
                                    ? <img src={displayAvatar} alt="avatar" className="h-full w-full object-cover" />
                                    : getInitial(user?.fullName || user?.username)
                                }
                            </div>
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
                            >
                                <IoCameraOutline className="text-sm" />
                            </button>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />

                        {avatarFile ? (
                            <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                                <IoCheckmarkOutline className="shrink-0 text-purple-500" />
                                <span className="max-w-[180px] truncate">{avatarFile.name}</span>
                                <button
                                    onClick={handleRemoveAvatarPreview}
                                    className="ml-1 text-gray-400 hover:text-red-500"
                                >
                                    <IoCloseOutline />
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Click avatar to change · Max 5MB</p>
                        )}
                    </div>

                    {/*Read-only info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
                            <IoPersonOutline className="shrink-0 text-gray-400 text-sm" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Username</p>
                                <p className="text-sm font-medium text-gray-700">@{user?.username || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
                            <IoPersonOutline className="shrink-0 text-gray-400 text-sm" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-700">{user?.email || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/*Editable full name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
                            Full Name
                        </label>
                        <div className="relative flex items-center">
                            <IoPersonOutline className="absolute left-3 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                            />
                        </div>
                    </div>

                    {/*Save button*/}
                    <button
                        onClick={handleSave}
                        disabled={saving || !fullName.trim()}
                        className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                Saving…
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </button>

                </div>
            </div>
        </div>
    )
}

export default UpdateUserData