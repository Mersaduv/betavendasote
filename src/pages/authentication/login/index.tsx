import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { SubmitHandler } from 'react-hook-form'

import { useLoginMutation } from '@/services'

import Logo from '../../../../public/logo/Logo.png'
import { LoginForm } from '@/components/form'
import { HandleResponse, MetaTags } from '@/components/shared'

import type { ILoginForm, MobileNumberFormValues } from '@/types'
import Image from 'next/image'
import { useAppSelector } from '@/hooks'
import { useState } from 'react'
import { NextPage } from 'next'

const LoginPage: NextPage = () => {
  const [step, setStep] = useState(1)
  const [mobileNumber, setMobileNumber] = useState('')
  // ? Assets
  const { replace, query, push } = useRouter()
  const { generalSetting, logoImages } = useAppSelector((state) => state.design)
  // ? Login User
  const [login, { data, isSuccess, isError, isLoading, error }] = useLoginMutation()

  // ? Handlers
  const submitHander: SubmitHandler<MobileNumberFormValues> = ({ mobileNumber}) => {
    setMobileNumber(mobileNumber)
    login({ mobileNumber })
  }

  const onSuccess = () => {
    console.log(data)
    if (data?.count === 0) {
      push(`/authentication/login/verifyUser?mobileNumber=${mobileNumber}`)
    }
    else {
      push(`/authentication/login/user?mobileNumber=${mobileNumber}`)
    }
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
          isCode
        />
      )}
      <main className="h-screen pt-10">
        <MetaTags
          title={generalSetting?.title + ' | ' + 'ورود' || 'فروشگاه اینترنتی'}
          description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
          keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
        />
        <section className="container max-w-xl space-y-6 px-12 py-6 lg:rounded-lg lg:border-gray-100">
          <Link className="flex justify-center pb-4" passHref href="/">
            <img width={280} src={(logoImages?.orgImage && logoImages?.orgImage.imageUrl) || ''} alt="Venda Mode" />
          </Link>

          <LoginForm isLoading={isLoading} onSubmit={submitHander} />
        </section>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false })
