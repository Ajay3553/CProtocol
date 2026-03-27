import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
        const response = await fetch(`${API_BASE_URL}/api/users/current-user`, {
            method: 'GET',
            credentials: 'include',
        })

        const result = await response.json()

        if (!response.ok || !result?.success) {
            return rejectWithValue('Not authenticated')
        }

        return result.data
        } catch (error) {
        return rejectWithValue('Failed to fetch user')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
        await fetch(`${API_BASE_URL}/api/users/logout`, {
            method: 'POST',
            credentials: 'include',
        })
        return null
        } catch (error) {
        return rejectWithValue('Logout failed')
        }
    }
)

const initialState = {
    status: false,
    userData: null,
    isLoading: true,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
        state.status = true
        state.userData = action.payload
        state.isLoading = false
        },
        logout: (state) => {
        state.status = false
        state.userData = null
        state.isLoading = false
        },
    },
    extraReducers: (builder) => {
        // fetchCurrentUser
        builder
        .addCase(fetchCurrentUser.pending, (state) => {
            state.isLoading = true
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action) => {
            state.status = true
            state.userData = action.payload
            state.isLoading = false
        })
        .addCase(fetchCurrentUser.rejected, (state) => {
            state.status = false
            state.userData = null
            state.isLoading = false
        })

        // logoutUser
        builder
        .addCase(logoutUser.fulfilled, (state) => {
            state.status = false
            state.userData = null
            state.isLoading = false
        })
        .addCase(logoutUser.rejected, (state) => {
            // Even if API fails, clear local state
            state.status = false
            state.userData = null
            state.isLoading = false
        })
    },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer