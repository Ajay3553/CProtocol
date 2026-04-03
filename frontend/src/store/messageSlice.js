import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'

// Async thunks
export const fetchMessages = createAsyncThunk('messages/fetch', async (channelId, { rejectWithValue }) => {
    try {
        const res = await apiClient.get(`/api/messages/${channelId}`)
        return { channelId, messages: res.data.data }
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

    // Called after a message is sent — injects it immediately into local state
    addIncomingMessage: (state, action) => {
        const msg = action.payload
        const channelId = msg.channel
        if (!state.byChannel[channelId]) state.byChannel[channelId] = []
        state.byChannel[channelId].push(msg)
    },

    updateMessage: (state, action) => {
        const updated = action.payload
        const channelId = updated.channel

        if (!channelId || !state.byChannel[channelId]) return

        state.byChannel[channelId] = state.byChannel[channelId].map((msg) =>
            msg._id === updated._id ? { ...msg, ...updated } : msg
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