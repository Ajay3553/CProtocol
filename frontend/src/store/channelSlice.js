import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'

export const fetchUserChannels = createAsyncThunk(
    'channels/fetchUserChannels',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiClient.get('/api/channels/my-channels')
            return res.data.data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch channels')
        }
    }
)

export const createChannel = createAsyncThunk(
    'channels/createChannel',
    async ({ name, type, participants }, { rejectWithValue }) => {
        try {
            const res = await apiClient.post('/api/channels/create', { name, type, participants })
            return res.data.data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create channel')
        }
    }
)

export const fetchChannelDetails = createAsyncThunk(
    'channels/fetchChannelDetails',
    async (channelId, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/api/channels/${channelId}`)
            return res.data.data
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch channel')
        }
    }
)

const channelSlice = createSlice({
    name: 'channels',
    initialState: {
        channels: [],
        activeChannel: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        setActiveChannel: (state, action) => {
            state.activeChannel = action.payload
        },
        // Called on socket receive message to update sidebar preview
        updateLastMessage: (state, action) => {
            const { channelId, message } = action.payload
            const ch = state.channels.find(c => c._id === channelId)
            if (ch) ch.lastMessage = message
        },
        clearChannelError: (state) => { state.error = null }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserChannels.pending, (state) => { state.isLoading = true; state.error = null })
            .addCase(fetchUserChannels.fulfilled, (state, action) => { state.isLoading = false; state.channels = action.payload })
            .addCase(fetchUserChannels.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })
            .addCase(createChannel.fulfilled, (state, action) => { state.channels.unshift(action.payload) })
            .addCase(fetchChannelDetails.fulfilled, (state, action) => { state.activeChannel = action.payload })
    }
})

export const { setActiveChannel, updateLastMessage, clearChannelError } = channelSlice.actions
export default channelSlice.reducer