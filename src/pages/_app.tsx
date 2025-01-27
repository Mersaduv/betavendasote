import '../styles/main.css'
import '../styles/browser-styles.css'
import '../styles/swiper.css'
import 'ckeditor5/ckeditor5.css'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'

import { ComponentType, FC, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Provider, useDispatch } from 'react-redux'
import { AppProps } from 'next/app'
import { setGeneralSetting, setLogoImages, store } from '@/store'
import { setCredentials, clearCredentials } from '@/store'
import { PageTransitionLoading, Alert } from '@/components/ui'
import {
  authApiSlice,
  useGenerateNewTokenMutation,
  useGetGeneralSettingQuery,
  useGetLogoImagesQuery,
  useLazyUpdateLastActivityQuery,
} from '@/services'
import { checkTokenValidity, useAppDispatch, useAppSelector } from '@/hooks'
import { UserInfo } from '@/types'
interface AppContentProps {
  Component: ComponentType<any>
  pageProps: any
}
const AppContent: FC<AppContentProps> = ({ Component, pageProps }) => {
  const { asPath, events } = useRouter()
  const { userInfo } = useAppSelector((state) => state.auth)
  const { generalSetting, logoImages } = useAppSelector((state) => state.design)
  const { data: generalSettingData } = useGetGeneralSettingQuery()
  const { data: logoImagesData } = useGetLogoImagesQuery()
  const [updateLastActivity] = useLazyUpdateLastActivityQuery()
  const dispatch = useAppDispatch()

  const handleUpdateActivity = async () => {
    try {
      await updateLastActivity().unwrap()
    } catch (err) {
      console.error('خطا در بروزرسانی فعالیت:', err)
    }
  }

  useEffect(() => {
    handleUpdateActivity()
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      handleUpdateActivity()
    }

    events.on('routeChangeComplete', handleRouteChange)
    return () => {
      events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    if (generalSettingData?.data) {
      dispatch(setGeneralSetting(generalSettingData.data))
    }
    if (logoImagesData?.data) {
      dispatch(setLogoImages(logoImagesData.data[0]))
    }
  }, [generalSettingData, logoImagesData, dispatch])

  useEffect(() => {
    const faviconUrl = logoImages?.faviconImage?.imageUrl || ''
    const existingLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
    if (existingLink) {
      existingLink.href = faviconUrl
    } else {
      const link = document.createElement('link') as HTMLLinkElement
      link.rel = 'icon'
      link.href = faviconUrl
      document.head.appendChild(link)
    }
  }, [logoImages])

  // Fix Hydration
  const [showChild, setShowChild] = useState<boolean>(false)
  useEffect(() => {
    setShowChild(true)
  }, [])

  if (!showChild) {
    return null
  }

  return (
    <>
      <Component {...pageProps} />
      {!asPath.includes('/products?category') ? <PageTransitionLoading /> : null}
      <Alert />
    </>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AppContent Component={Component} pageProps={pageProps} />
    </Provider>
  )
}
