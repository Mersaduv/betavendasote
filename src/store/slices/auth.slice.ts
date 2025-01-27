import { IAddress } from '@/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userInfo: {
    role: string
    userType: number
    mobileNumber: string | null
    fullName: string | null
    expireTime: number | null
    refreshTokenExpireTime: number | null
  } | null
  address: IAddress
  loggedIn: boolean
}

const getToken = () => (typeof window !== 'undefined' && localStorage.getItem('token')) || null
const getRefreshToken = () => (typeof window !== 'undefined' && localStorage.getItem('refreshToken')) || null
const getUserInfo = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('userInfo')) {
    var data = JSON.parse(localStorage.getItem('userInfo') as string)
    return data
  }
  return null
}
const getAddress = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('address')) {
    var data = JSON.parse(localStorage.getItem('address') as string)
    return data
  }
  return null
}
const getLoggedIn = () => {
  if (typeof window !== 'undefined') {
    const loggedIn = localStorage.getItem('loggedIn')
    return loggedIn !== null ? JSON.parse(loggedIn) : false
  }
}

const initialState: AuthState = {
  token: getToken(),
  refreshToken: getRefreshToken(),
  userInfo: getUserInfo(),
  address: getAddress(),
  loggedIn: getLoggedIn(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<IAddress>) => {
      const data = action.payload
      state.address = data
      if (typeof window !== 'undefined') {
        localStorage.setItem('address', JSON.stringify(data))
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; userInfo: any; loggedIn: boolean }>
    ) => {
      const { token, refreshToken, userInfo, loggedIn } = action.payload
      state.token = token
      state.refreshToken = refreshToken
      state.userInfo = userInfo
      state.loggedIn = loggedIn
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    setCredentialsToken: (state, action: PayloadAction<{ token: string; refreshToken: string; loggedIn: boolean }>) => {
      const { token, refreshToken, loggedIn } = action.payload
      state.token = token
      state.refreshToken = refreshToken
      state.loggedIn = loggedIn
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('loggedIn', JSON.stringify(loggedIn))
      }
    },
    clearCredentials: (state) => {
      state.token = null
      state.refreshToken = null
      state.userInfo = null
      state.loggedIn = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('loggedIn')
      }
    },
  },
})

export const { setAddress, setCredentials, setCredentialsToken, clearCredentials } = authSlice.actions

export default authSlice.reducer
