import { GeneralSettingForm, LogoImagesForm } from '@/components/ads'
import { RedirectForm } from '@/components/designs'
import { DashboardLayout } from '@/components/Layouts'
import DesignTabDashboardLayout from '@/components/Layouts/DesignTabDashboardLayout'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { useAppDispatch } from '@/hooks'
import {
  useGetGeneralSettingQuery,
  useGetLogoImagesQuery,
  useGetRedirectsQuery,
  useUpsertGeneralSettingMutation,
  useUpsertLogoImagesMutation,
  useUpsertRedirectsMutation,
} from '@/services'
import { showAlert } from '@/store'
import { IGeneralSettingForm, ILogosForm, IRedirect } from '@/types'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
const fetchImageAsFile = async (url: string): Promise<File> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch image from `)
    }
    const blob = await response.blob()
    const fileName = url.split('/').pop()
    return new File([blob], fileName || 'image.jpg', { type: blob.type })
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error)
    throw error
  }
}
interface FormData {
  generalSetting: IGeneralSettingForm
  logoImages: ILogosForm
  redirects: IRedirect
}
const SiteItems: NextPage = () => {
  // asset
  const dispatch = useAppDispatch()

  const methods: UseFormReturn<FormData> = useForm<FormData>({
    defaultValues: {
      generalSetting: {
        id: '',
        title: '',
        shortIntroduction: '',
        googleTags: '',
      },
      logoImages: {},
      redirects: {},
    },
  })

  // Queries
  const {
    data: generalSettingData,
    isLoading: isLoadingGeneralSetting,
    isError: isErrorGeneralSetting,
  } = useGetGeneralSettingQuery()
  const { data: redirectData, isLoading: isLoadingRedirect, isError: isErrorRedirect } = useGetRedirectsQuery()
  const { data: logoImagesData, isLoading: isLoadingLogoImages, isError: isErrorLogoImages } = useGetLogoImagesQuery()

  // ? State
  const [selectedMainFile, setMainSelectedFiles] = useState<any[]>([])
  const [selectedFaviconFile, setFaviconFile] = useState<any[]>([])

  // ? Upsert
  const [
    upsertRedirect,
    {
      isLoading: isUpsertLoadingRedirect,
      isSuccess: isUpsertSuccessRedirect,
      isError: isUpsertErrorRedirect,
      error: upsertRedirectError,
    },
  ] = useUpsertRedirectsMutation()

  const [
    upsertGeneralSetting,
    {
      isLoading: isUpsertLoadingGeneralSetting,
      isSuccess: isUpsertSuccessGeneralSetting,
      isError: isUpsertErrorGeneralSetting,
      error: upsertGeneralSettingError,
    },
  ] = useUpsertGeneralSettingMutation()

  const [
    upsertLogoImages,
    {
      isLoading: isUpsertLoadingLogoImagesSetting,
      isSuccess: isUpsertSuccessLogoImages,
      isError: isUpsertErrorLogoImages,
      error: upsertLogoImagesError,
    },
  ] = useUpsertLogoImagesMutation()

  const onSubmit = async (data: FormData) => {
    console.log(data, 'data all')

    const promises = []
    // General Setting
    const upsertGeneralSettingPromise = (async () => {
      if (data.generalSetting) {
        const upsertData = {
          id: data.generalSetting.id || undefined,
          title: data.generalSetting.title,
          shortIntroduction: data.generalSetting.shortIntroduction,
          googleTags: data.generalSetting.googleTags,
        }
        await upsertGeneralSetting(upsertData)
      }
    })()
    promises.push(upsertGeneralSettingPromise)

    // logo images
    const upsertLogoImagesPromise = (async () => {
      if (data.logoImages) {
        const formLogoImagesData = new FormData()
        if (data.logoImages.id) formLogoImagesData.append('id', data.logoImages.id)
        if (data.logoImages.orgThumbnail) formLogoImagesData.append('OrgThumbnail', data.logoImages.orgThumbnail)
        if (data.logoImages.faviconThumbnail)
          formLogoImagesData.append('FaviconThumbnail', data.logoImages.faviconThumbnail)

        await upsertLogoImages(formLogoImagesData)
      }
    })()
    promises.push(upsertLogoImagesPromise)

    // redirects
    if (data.redirects) {
      const upsertRedirectPromise = (async () => {
        const upsertData: IRedirect = {
          id: data.redirects.id || undefined,
          articleId: data.redirects.articleId,
        }
        await upsertRedirect(upsertData)
      })()
      promises.push(upsertRedirectPromise)
    }

    await Promise.all(promises)
  }

  // load data
  useEffect(() => {
    const loadAllData = async () => {
      const logoImages = logoImagesData?.data
        ? await Promise.all(
            logoImagesData.data.map(async (logoImage) => {
              const imageMainFile = logoImage.orgImage ? await fetchImageAsFile(logoImage.orgImage.imageUrl) : null
              const imageFaviconFile = logoImage.faviconImage
                ? await fetchImageAsFile(logoImage.faviconImage.imageUrl)
                : null

              return {
                id: logoImage.id,
                orgThumbnail: imageMainFile,
                faviconThumbnail: imageFaviconFile,
              }
            })
          )
        : []

      if (logoImages.length > 0) {
        setMainSelectedFiles(logoImages[0].orgThumbnail ? [logoImages[0].orgThumbnail] : [])
        setFaviconFile(logoImages[0].faviconThumbnail ? [logoImages[0].faviconThumbnail] : [])
      }

      methods.reset({
        generalSetting: generalSettingData?.data
          ? {
              id: generalSettingData.data.id || '',
              title: generalSettingData.data.title || '',
              shortIntroduction: generalSettingData.data.shortIntroduction || '',
              googleTags: generalSettingData.data.googleTags || '',
            }
          : {},
        logoImages: logoImages.length > 0 ? logoImages[0] : {},
        redirects: redirectData?.data || {},
      })
    }

    loadAllData()
  }, [generalSettingData, logoImagesData, redirectData, methods])

  // handle success alert
  useEffect(() => {
    let alertMessage = ' بروزرسانی با موفقیت انجام شد'

    const errors = []

    if (isUpsertErrorGeneralSetting) {
      errors.push('به‌روزرسانی متن هدر')
    }

    if (isUpsertErrorLogoImages) {
      errors.push('به‌روزرسانی تصویر های لوگو')
    }

    if (isUpsertErrorRedirect) {
      errors.push('به‌روزرسانی ریدایرکت')
    }

    if (errors.length > 0) {
      alertMessage += ` (خطا در: ${errors.join(', ')})`
    }

    if (
      isUpsertSuccessGeneralSetting ||
      isUpsertSuccessLogoImages ||
      isUpsertSuccessRedirect ||
      isUpsertErrorGeneralSetting ||
      isUpsertErrorLogoImages ||
      isUpsertErrorRedirect
    ) {
      dispatch(
        showAlert({
          status: errors.length > 0 ? 'warning' : 'success',
          title: alertMessage,
        })
      )
    }
  }, [
    isUpsertSuccessGeneralSetting,
    isUpsertSuccessLogoImages,
    isUpsertSuccessRedirect,
    isUpsertSuccessGeneralSetting,
    isUpsertErrorLogoImages,
    isUpsertErrorRedirect,
  ])
  const isFormSubmitting = isUpsertLoadingGeneralSetting || isUpsertLoadingLogoImagesSetting || isUpsertLoadingRedirect
  return (
    <ProtectedRouteWrapper>
      <>
        <DashboardLayout>
          <DesignTabDashboardLayout>
            <Head>
              <title>نمای سایت | تنظیمات عمومی</title>
            </Head>
            <FormProvider {...methods}>
              <form className="space-y-5 mb-2 mx-3" onSubmit={methods.handleSubmit(onSubmit)}>
                {/* 1. تنظیمات عمومی */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <GeneralSettingForm />
                  <LogoImagesForm
                    selectedFaviconFile={selectedFaviconFile}
                    setFaviconFile={setFaviconFile}
                    selectedMainFile={selectedMainFile}
                    setMainSelectedFiles={setMainSelectedFiles}
                  />
                </div>
                <RedirectForm />
                <div className="w-full flex justify-end mt-6">
                  <Button
                    isLoading={isFormSubmitting}
                    type="submit"
                    className="bg-[#e90089] px-5 py-2.5 hover:bg-[#e90088bb]"
                    // disabled={isFormSubmitting}
                  >
                    {'بروزسانی'}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </DesignTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(SiteItems), { ssr: false })
