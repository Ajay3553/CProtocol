import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'
import { getChannelKey, decryptMessagesList, decryptSingleMessage } from '../utils/encryption'

// Async thunks
export const fetchMessages = createAsyncThunk('messages/fetch', async (channelId, { rejectWithValue }) => {
    try {
        const res = await apiClient.get(`/api/messages/channel-messages/${channelId}`)
        const rawMessages = res.data.data || []
        const aesKey = getChannelKey(channelId)
        const messages = aesKey ? decryptMessagesList(rawMessages, aesKey) : rawMessages
        return { channelId, messages }
    } catch (e) {
        return rejectWithValue(e?.response?.data?.message || 'Failed to fetch messages')
    }
})

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        byChannel: {},       // { [channelId]: Message[] }
        isLoading: false,
        error: null,
    },
    reducers: {

    // Called after a message is sent or received — injects it into local state
    addIncomingMessage: (state, action) => {
        const msg = action.payload
        if (!msg) return
        const channelId = typeof msg.channel === 'object' && msg.channel !== null ? msg.channel._id?.toString() : msg.channel?.toString()
        if (!channelId) return
        const aesKey = getChannelKey(channelId)
        const processedMsg = aesKey ? decryptSingleMessage(msg, aesKey) : msg

        if (!state.byChannel[channelId]) state.byChannel[channelId] = []
        const exists = state.byChannel[channelId].some((m) => m._id === processedMsg._id)
        if (!exists) {
            state.byChannel[channelId].push(processedMsg)
        }
    },

    updateMessage: (state, action) => {
        const updated = action.payload
        if (!updated) return
        const channelId = typeof updated.channel === 'object' && updated.channel !== null ? updated.channel._id?.toString() : updated.channel?.toString()

        if (!channelId || !state.byChannel[channelId]) return
        const aesKey = getChannelKey(channelId)
        const processedMsg = aesKey ? decryptSingleMessage(updated, aesKey) : updated

        state.byChannel[channelId] = state.byChannel[channelId].map((msg) =>
            msg._id === processedMsg._id ? { ...msg, ...processedMsg } : msg
        )
    },

    softDeleteMessage: (state, action) => {
        const messageId = action.payload

        Object.keys(state.byChannel).forEach((channelId) => {
            state.byChannel[channelId] = state.byChannel[channelId].map((msg) =>
            msg._id === messageId
                ? { ...msg, isDeleted: true, content: '' }
                : msg
            )
        })
    },

    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMessages.pending, (state) => { state.isLoading = true; state.error = null })
        .addCase(fetchMessages.fulfilled, (state, action) => {
            state.isLoading = false
            state.byChannel[action.payload.channelId] = action.payload.messages
        })
        .addCase(fetchMessages.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })
    },
})

export const {
    addIncomingMessage,
    updateMessage,
    softDeleteMessage,
} = messageSlice.actions

export default messageSlice.reducer