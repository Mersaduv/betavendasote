import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'

import { roles } from '@/utils'

import { ProtectedRouteWrapper } from '@/components/user'
import { DashboardAdminAside } from '@/components/shared'

import type { NextPage } from 'next'
import Link from 'next/link'
import { DashboardLayout } from '@/components/Layouts'
import { useAppSelector } from '@/hooks'
const AdminPage: NextPage = () => {
  const { generalSetting } = useAppSelector((state) => state.design)
  return (
    <ProtectedRouteWrapper>
      <div className="">
        <Head>
          <title>پیشخوان  </title>
        </Head>
        <DashboardLayout>
          <div className=" flex " >
            <div>
            </div>
            <div className="">
              <section className="py-20">چارت و انالیز..</section>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(AdminPage), { ssr: false })
