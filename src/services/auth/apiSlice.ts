import baseApi from '@/services/baseApi'

import type {
  GenerateNewTokeResult,
  GenerateNewToken,
  LoginQuery,
  LoginResult,
  MsgResult,
  RegisterUserQuery,
  RegisterUserResult,
  UserData,
  UserResult,
} from './types'

import { setCredentials, clearCredentials, setCredentialsToken } from '@/store'
import { getToken } from '@/utils'
import { ApiError } from '@/types'
import { digitsFaToEn } from '@persian-tools/persian-tools'

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterUserResult, RegisterUserQuery>({
      query: (data) => ({
        url: '/api/auth/register',
        method: 'POST',
        data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data && data.data!.token && data.data!.refreshToken) {
            dispatch(
              setCredentials({
                token: data.data!.token,
                refreshToken: data.data!.refreshToken,
                userInfo: {
                  role: data.data?.role,
                  userType: data.data?.userType,
                  mobileNumber: data.data?.mobileNumber,
                  fullName: data.data?.fullName,
                  expireTime: data.data?.expireTime,
                  refreshTokenExpireTime: data.data?.refreshTokenExpireTime,
                },
                loggedIn: true,
              })
            )
          }
        } catch (error) {
          console.error('Failed to register and save tokens:', error)
        }
      },
    }),

    login: builder.mutation<LoginResult, LoginQuery>({
      query: ({ mobileNumber, password }) => {
        const mobile = digitsFaToEn(mobileNumber)
        const passCode = digitsFaToEn(password)
        const body: LoginQuery = { mobileNumber: mobile, password: passCode }
        return {
          url: '/api/auth/login',
          method: 'POST',
          body,
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          console.log(data , "datadata");
          if (data && data.data?.token && data.data?.refreshToken) {
            
            dispatch(
              setCredentials({
                token: data.data?.token,
                refreshToken: data.data?.refreshToken,
                userInfo: {
                  role: data.data?.role ?? "",
                  userType: data.data?.userType,
                  mobileNumber: data.data?.mobileNumber,
                  fullName: data.data?.fullName,
                  expireTime: data.data?.expireTime,
                  refreshTokenExpireTime: data.data?.refreshTokenExpireTime,
                },
                loggedIn: true,
              })
            )
          }
        } catch (error) {
          console.error('Failed to login and save tokens:', error)
        }
      },
    }),
    logout: builder.mutation<MsgResult, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'GET',
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Clear credentials in redux store
          dispatch(clearCredentials())
        } catch (error) {
          console.error('Failed to logout:', error)
        }
      },
    }),

    generateNewToken: builder.mutation<GenerateNewTokeResult, GenerateNewToken>({
      query: (data) => ({
        url: '/api/auth/generateToken',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data && data.data!.token && data.data!.refreshToken) {
            dispatch(
              setCredentialsToken({
                token: data.data!.token,
                refreshToken: data.data!.refreshToken,
                loggedIn: true,
              })
            )
          }
        } catch (error) {
          console.error('Failed to refresh token:', error)
          dispatch(clearCredentials())
        }
      },
    }),

    getUserInfo: builder.query<UserResult, string>({
      query: (mobileNumber) => ({
        url: `/api/user/info?mobileNumber=${mobileNumber}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, mobileNumber) => [{ type: 'User', id: mobileNumber }],
      async onQueryStarted(mobileNumber, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          // save new data localStorage
          window.localStorage.setItem('userInfo', JSON.stringify(data.data))
        } catch (error) {
          const err = error as ApiError
          if (err.error.status === 401) {
            // if 401 unauthorize
            const token = window.localStorage.getItem('token')
            const refreshToken = window.localStorage.getItem('refreshToken')
            try {
              const { data: newTokenData } = await dispatch(
                authApiSlice.endpoints.generateNewToken.initiate({ token: token!, refreshToken: refreshToken! })
              ).unwrap()

              dispatch(
                setCredentialsToken({
                  token: newTokenData!.token,
                  refreshToken: newTokenData!.refreshToken,
                  loggedIn: true,
                })
              )

              // try again to getting new data of user by new token
              const { data } = await dispatch(authApiSlice.endpoints.getUserInfo.initiate(mobileNumber)).unwrap()
              // save new data on localStorage
              window.localStorage.setItem('userInfo', JSON.stringify(data))
            } catch (error) {
              console.error('Failed to refresh token and retry getUserInfo:', error)
              dispatch(clearCredentials())
            }
          } else {
            console.error('Failed to fetch user info:', error)
          }
        }
      },
    }),

    getUserInfoMe: builder.query<UserData, void>({
      query: () => ({
        url: `/api/user/info/me`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      providesTags: (result, error, arg) => [{ type: 'User', id: 'ME' }],
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          // // save new data localStorage
          // window.localStorage.setItem('userInfo', JSON.stringify(data.data?.userInfo))
        } catch (error) {
          const err = error as ApiError
          if (err.error.status === 401) {
            // if 401 unauthorize
            const token = window.localStorage.getItem('token')
            const refreshToken = window.localStorage.getItem('refreshToken')
            try {
              const { data: newTokenData } = await dispatch(
                authApiSlice.endpoints.generateNewToken.initiate({ token: token!, refreshToken: refreshToken! })
              ).unwrap()

              dispatch(
                setCredentialsToken({
                  token: newTokenData!.token,
                  refreshToken: newTokenData!.refreshToken,
                  loggedIn: true,
                })
              )

              // try again to getting new data of user by new token
              const { data } = await dispatch(
                authApiSlice.endpoints.getUserInfo.initiate(newTokenData?.mobileNumber!)
              ).unwrap()
              // save new data on localStorage
              window.localStorage.setItem('userInfo', JSON.stringify(data))
            } catch (error) {
              console.error('Failed to refresh token and retry getUserInfo:', error)
              dispatch(clearCredentials())
            }
          } else {
            console.error('Failed to fetch user info:', error)
          }
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGenerateNewTokenMutation,
  useGetUserInfoQuery,
  useGetUserInfoMeQuery,
} = authApiSlice
