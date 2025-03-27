import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPage } from 'next'
import { DashboardLayout } from '@/components/Layouts'

const Design: NextPage = () => {
  // ? Assets
  const { replace, query } = useRouter()

  // ? Handlers

  const onSuccess = () => replace(query?.redirectTo?.toString() || '/admin/design')

  // ? Render(s)
  return (
    <>
      {/*  Handle Login Response */}
      {/* {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.data?.fullName}
          onSuccess={onSuccess}
          isLogin
        />
      )} */}

      <main className="grid min-h-screen items-center">
        <Head>
          <title>مدیریت | دیزاین</title>
        </Head>
        <DashboardLayout>
          <section className="bg-[#f5f8fa] w-full pt-[65px]">
          </section>
        </DashboardLayout>
      </main>
    </>
  )
}

export default dynamic(() => Promise.resolve(Design), { ssr: false })
