import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPage } from 'next'
import { DashboardLayout } from '@/components/Layouts'
import { MainPageAdsForm } from '@/components/form'
import DesignTabDashboardLayout from '@/components/Layouts/DesignTabDashboardLayout'
import { ProtectedRouteWrapper } from '@/components/user'

const Main: NextPage = () => {
  // ? Assets
  const { replace, query } = useRouter()

  // ? Handlers

  const onSuccess = () => replace(query?.redirectTo?.toString() || '/admin/Main')

  // ? Render(s)
  return (
    <ProtectedRouteWrapper>
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
            <title>نمای سایت | صفحه اصلی</title>
          </Head>
          <DashboardLayout>
            <DesignTabDashboardLayout>
              <section className="bg-[#f5f8fa] w-full mt-9">
                <MainPageAdsForm />
              </section>
            </DesignTabDashboardLayout>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Main), { ssr: false })
