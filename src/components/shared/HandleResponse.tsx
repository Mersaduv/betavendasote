import { useEffect } from 'react'

import { showAlert } from '@/store'

import { useAppDispatch } from '@/hooks'

import { getErrorMessage } from '@/utils'

import type { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import type { SerializedError } from '@reduxjs/toolkit'

interface Props {
  isSuccess: boolean
  isError: boolean
  error?: FetchBaseQueryError | SerializedError
  message?: string
  onSuccess?: () => void
  onError?: () => void
  isLogin?: boolean
  isCode?: boolean
  errorAndSuccess?: boolean
}

const HandleResponse: React.FC<Props> = (props) => {
  // ? Porps
  const { isSuccess, isError, error, message, onSuccess, onError, isLogin, isCode, errorAndSuccess } = props
  // ? Assets
  const dispatch = useAppDispatch()

  // ? Re-Renders
  useEffect(() => {
    if (isSuccess && isCode) {
      onSuccess?.()

      dispatch(
        showAlert({
          status: errorAndSuccess !== undefined && errorAndSuccess === false ? 'error' : 'success',
          title: isCode ? `${message}` : message || 'عملیات با موفقیت انجام شد',
        })
      )
    }

    if (isSuccess && isCode === undefined) {
      onSuccess?.()

      dispatch(
        showAlert({
          status: errorAndSuccess !== undefined && errorAndSuccess === false ? 'error' : 'success',
          title: isLogin ? `خوش آمدی ${message}` : message || 'عملیات با موفقیت انجام شد',
        })
      )
    }

    if (isError && error) {
      onError?.()

      dispatch(
        showAlert({
          status: 'error',
          title: getErrorMessage(error) || 'متاسفانه خطایی رخ داده است',
        })
      )
    }
  }, [isSuccess, isError, error])

  return null
}

export default HandleResponse
