import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import { ProtectedRouteWrapper } from '@/components/user'

const Jewelry = () => {
  return (
    <ProtectedRouteWrapper>
      <>
        <DashboardLayout>
          <TabDashboardLayout>
            <Head>
              <title>مدیریت | زیورالات</title>
            </Head>
            <div className="relative overflow-x-auto min-h-96">
              <div className="mt-4 mb-4 overflow-auto rounded-lg shadow-item mx-2 bg-white">
                <div>محتوای زیورالات</div>
              </div>
            </div>
          </TabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Jewelry), { ssr: false })
