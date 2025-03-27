import { ProfileLayout } from '@/components/Layouts'
import { Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { useAppSelector, useDisclosure } from '@/hooks'
import { Plus } from '@/icons'
import {
  useGetSingleNotificationQuery,
  useGetTicketQuery,
  useGetTicketsQuery,
  useUpdateNotificationStatusMutation,
} from '@/services'
import type { NextPage } from 'next'
import Head from 'next/head'
import moment from 'moment-jalaali'
import { useRouter } from 'next/router'
import { TicketMessageModal } from '@/components/modals'
import { useEffect } from 'react'
const Notification: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const idQuery = (query.id as string) ?? undefined
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()

  // ? Queries
  const { data: notificationData, isLoading: notificationLoading } = useGetSingleNotificationQuery(
    { id: idQuery },
    {
      skip: idQuery == undefined,
    }
  )

  const [
    updateNotificationStatus,
    { isLoading: isLoadingUpdate, isError: isErrorUpdate, error: errorUpdate, isSuccess: isSuccessUpdate },
  ] = useUpdateNotificationStatusMutation()

  useEffect(() => {
    if (idQuery) {
      updateNotificationStatus({ id: idQuery })
    }
  }, [idQuery])

  console.log(notificationData, 'notificationData')

  return (
    <main id="profileTickets">
      <MetaTags
        title={'پروفایل' + ' | ' + 'اعلانات '}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="">
          <div>
            <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
              {' '}
              <h3 className="px-3 py-2.5">{'اعلانات'}</h3>
            </div>

            <div className="mt-2">
              <span className="mx-4">عنوان</span>
              <div className="border rounded-md p-4 mx-4 mt-1">{notificationData?.data?.subject}</div>
            </div>

            <div className="mt-2">
              <span className="mx-4">توضیحات</span>
              <div
                className="mt-1 border mx-4 rounded-md p-4 whitespace-normal"
                dangerouslySetInnerHTML={{ __html: notificationData?.data?.description ?? '' }}
              />
            </div>
          </div>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default Notification
