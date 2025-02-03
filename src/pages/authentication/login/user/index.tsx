import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { SubmitHandler } from 'react-hook-form'

import { useLoginMutation } from '@/services'

import Logo from '../../../../public/logo/Logo.png'
import { LoginForm, LoginUserForm } from '@/components/form'
import { HandleResponse, MetaTags } from '@/components/shared'

import type { ILoginForm, MobileNumberFormValues } from '@/types'
import Image from 'next/image'
import { useAppSelector } from '@/hooks'
import { useState } from 'react'
import { NextPage } from 'next'

const LoginUserPage: NextPage = () => {
  const [step, setStep] = useState(1)
  // ? Assets
  const { replace, query, push } = useRouter()
  const mobileNumberQuery = (query.mobileNumber as string) ?? ''
  const { generalSetting, logoImages } = useAppSelector((state) => state.design)
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  // ? Handlers
  const submitHander: SubmitHandler<ILoginForm> = ({ password, mobileNumber }) => {
    login({ mobileNumber, password })
  }

  const onSuccess = () => {
    console.log(data)
    // if (data?.count === 1) {
    push(`/`)
    // } else {
    //   push(`/authentication/login/user?mobileNumber=${mobileNumberState}`)
    // }
  }
  if (error) {
    console.log(error, 'error')
  }
  // ? Render(s)
  return (
    <>
      {/*  Handle Login Response */}
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
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
        <section className="container max-w-xl space-y-6 px-12 py-6 lg:rounded-lg lg:border-gray-100">
          <Link className="flex justify-center pb-4" passHref href="/">
            <img width={280} src={(logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''} alt="Venda Mode" />
          </Link>

          <LoginUserForm mobileNumber={mobileNumberQuery} isLoading={isLoading} onSubmit={submitHander} />
        </section>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(LoginUserPage), { ssr: false })
