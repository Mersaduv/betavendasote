import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'

import { useAppSelector } from '@/hooks'

import { truncate } from '@/utils'

import { EmptyCart } from '@/icons'
import { ProfileLayout } from '@/components/Layouts'
import { PageContainer, ResponsiveImage } from '@/components/ui'

import type { NextPage } from 'next'
import { Header, MetaTags } from '@/components/shared'
import { useGetNotificationsQuery } from '@/services'
import { IoNotificationsOutline } from 'react-icons/io5'
import moment from 'moment-jalaali'

const Notifications: NextPage = () => {
  // ? Store
  const { generalSetting } = useAppSelector((state) => state.design)
  const { data: notificationData } = useGetNotificationsQuery({ pageSize: 9999 })
  // ? selector
  return (
    <main>
      <MetaTags
        title={'پروفایل' + ' | ' + 'اعلانات'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="بازدید‌های اخیر">
          <div className="flex mt-3 px-4 text-sm md:text-base mx-3 border border-[#e90089] rounded-md py-2 justify-between items-center bg-[#fde5f3] text-[#e90089]">
            {' '}
            <h3 className="px-3 py-2.5">{'اعلانات'}</h3>
          </div>
          <section className="px-3 pt-4 space-y-4">
            {notificationData?.data?.data?.map((item) => {
              return (
                <Link
                  href={`/profile/notifications/${item.id}`}
                  className={`items-end justify-between w-full gap-3 flex border ${
                    !item.isRead && 'border-[#e90089]'
                  } rounded-md p-3 cursor-pointer hover:shadow transition-all hover:bg-[#e9008809]`}
                  key={item.id}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-[#fde5f3] rounded-full flex items-center justify-center text-[#e90089]">
                      <IoNotificationsOutline className="h-6 w-6" />
                    </div>
                    <div className="line-clamp-1 overflow-hidden text-ellipsis">{item.subject}</div>
                  </div>
                  <div className="text-gray-500 text-[13px] farsi-digits whitespace-nowrap">
                    {moment(item.created).format('jYYYY/jMM/jDD HH:mm')}
                  </div>
                </Link>
              )
            })}
          </section>
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default dynamic(() => Promise.resolve(Notifications), { ssr: false })
