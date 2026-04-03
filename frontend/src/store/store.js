import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import channelReducer from './channelSlice'
import messageReducer from './messageSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        channels: channelReducer,
        messages: messageReducer,
    }
})

export default store