import dynamic from 'next/dynamic'
import Head from 'next/head'
import { roles } from '@/utils'
import { ProtectedRouteWrapper } from '@/components/user'
import { Header, MetaTags, UserProfileAside } from '@/components/shared'
import { ClientLayout, ProfileLayout } from '@/components/Layouts'
import { Skeleton, PageContainer } from '@/components/ui'
import type { NextPage } from 'next'
import { useEditUserMutation, useGetUserInfoMeQuery, useGetUserInfoQuery } from '@/services'
import { showAlert } from '@/store'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { ProfileForm as ProfileFormType } from '@/types'
import { ProfileForm } from '@/components/form'
import { useEffect, useState } from 'react'

const ProfilePage: NextPage = () => {
  const { data: userData, isLoading, refetch } = useGetUserInfoMeQuery()
  const [editUser, { isLoading: isEditLoading }] = useEditUserMutation()
  const { isActive } = useAppSelector((state) => state.headerTextState)
  const { generalSetting } = useAppSelector((state) => state.design)
  const [defaultValues, setDefaultValues] = useState<ProfileFormType | undefined>(undefined)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (userData) {
      setDefaultValues({
        mobileNumber: userData.data?.mobileNumber || '',
        gender: userData.data?.userSpecification.gender || 'آقا',
        firstName: userData.data?.userSpecification.firstName || '',
        familyName: userData.data?.userSpecification.familyName || '',
        nationalCode: userData.data?.userSpecification.nationalCode || '',
        birthDate: userData.data?.userSpecification.birthDate || '',
        bankAccountNumber: userData.data?.userSpecification.bankAccountNumber || '',
        shabaNumber: userData.data?.userSpecification.shabaNumber || '',
        email: userData.data?.userSpecification.email || '',
      })
    }
  }, [userData])

  const handleSubmit = async (data: ProfileFormType) => {
    try {
      await editUser({ body: { ...data, mobileNumber: userData?.data?.mobileNumber } }).unwrap()
      dispatch(
        showAlert({
          status: 'success',
          title: 'پرفایل شما بروزرسانی شد',
        })
      )
      refetch()
    } catch (error) {
      console.error('Failed to update user data:', error)
    }
  }

  if (isLoading || !defaultValues) {
    return <Skeleton.Item animated="background" height="h-5" width="w-44" />
  }

  return (
    <ProtectedRouteWrapper isProfile>
      <MetaTags
        title={generalSetting?.title + ' | ' + 'پروفایل' || 'فروشگاه اینترنتی'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <div className={`lg:container lg:flex  lg:gap-x-4 ${isActive ? '' : ''}`}>
        <ProfileLayout isProfile>
          <PageContainer title=" ">
            <div className="flex w-full mt-4">
              {' '}
              <h3 className="pr-3 text-sm md:text-base mx-3 border border-[#e90089] w-full rounded-md py-4 flex justify-start items-center bg-[#fde5f3] text-[#e90089]">
                {'حساب کاربری'}
              </h3>
            </div>
            <section className="lg:flex border mx-4 mb-6 h-full pb-3 rounded-md px-4 pt-4 mt-4 ">
              {isLoading ? (
                <div className="grid grid-cols-2 w-full gap-x-5 gap-y-14 mt-4">
                  <Skeleton.Item animated="background" height="h-10" width="w-full" />
                  <Skeleton.Item animated="background" height="h-10" width="w-full" />
                  <Skeleton.Item animated="background" height="h-10" width="w-full" />
                  <Skeleton.Item animated="background" height="h-10" width="w-full" />
                  <Skeleton.Item animated="background" height="h-10" width="w-full" />
                </div>
              ) : (
                <ProfileForm onSubmit={handleSubmit} isLoading={isEditLoading} defaultValues={defaultValues!} />
              )}
            </section>
          </PageContainer>
        </ProfileLayout>
      </div>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(ProfilePage), { ssr: false })
