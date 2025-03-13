import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { SubmitHandler } from 'react-hook-form'

import { useLoginMutation, useVerifyUserMutation } from '@/services'

import Logo from '../../../../public/logo/Logo.png'
import { LoginForm, VerifyCodeForm } from '@/components/form'
import { HandleResponse, MetaTags } from '@/components/shared'

import type { ILoginForm, MobileNumberFormValues } from '@/types'
import Image from 'next/image'
import { useAppSelector } from '@/hooks'
import { useState } from 'react'
import { NextPage } from 'next'

const VerifyPage: NextPage = () => {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  // ? Assets
  const { replace, query } = useRouter()
  const mobileNumberQuery = (query.mobileNumber as string) ?? ''
  const [isResend, setIsResend] = useState(false)
  const { generalSetting, logoImages } = useAppSelector((state) => state.design)
  // ? Login User
  const [verify, { data, isSuccess, isError, isLoading, error }] = useVerifyUserMutation()
  const [
    login,
    { data: dataLogin, isSuccess: isSuccessLogin, isError: isErrorLogin, isLoading: isLoadingLogin, error: errorLogin },
  ] = useLoginMutation()
  // ? Handlers
  const submitHander: SubmitHandler<ILoginForm> = ({ mobileNumber, password }) => {
    verify({ mobileNumber, password })
  }

  const resendHandler = (data: MobileNumberFormValues) => {
    setIsResend(true)
    login(data)
  }

  const onSuccess = () => replace(query?.redirectTo?.toString() || '/')
  if (error) {
    console.log(error, 'error')
  }
  // ? Render(s)
  return (
    <>
      {/*  Handle Login Response */}
      {(isSuccessLogin || isErrorLogin) && (
        <HandleResponse
          isError={isErrorLogin}
          isSuccess={isSuccessLogin}
          error={errorLogin}
          message={isResend ? 'کد مجدد ارسال شد' : ''}
          onSuccess={() => {
            setIsResend(false)
          }}
          isLogin
          isCode
        />
      )}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.data?.fullName}
          onSuccess={onSuccess}
          isLogin
        />
      )}
      <main className="grid min-h-screen items-center">
        <MetaTags
          title={generalSetting?.title + ' | ' + 'ورود' || 'فروشگاه اینترنتی'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
        <section className="container max-w-[400px] space-y-6 px-4 py-6 lg:rounded-lg lg:border-gray-100">
          <Link className="flex justify-center pb-4" passHref href="/">
            <img width={280} src={(logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''} alt="Venda Mode" />
          </Link>
          <h2 className="text-gray-300 text-sm text-center farsi-digits">
            کد پیامک شده به شماره {mobileNumberQuery} را وارد کنید
          </h2>
          <VerifyCodeForm
            resendHandler={resendHandler}
            isLoading={isLoading}
            onSubmit={submitHander}
            mobileNumber={mobileNumberQuery}
          />
        </section>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(VerifyPage), { ssr: false })
