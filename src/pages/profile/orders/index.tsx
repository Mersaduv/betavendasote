import { ProfileLayout } from '@/components/Layouts'
import { EmptyOrdersList } from '@/components/emptyList'
import { DataStateDisplay, Header, MetaTags } from '@/components/shared'
import { PageContainer } from '@/components/ui'
import { NextPage } from 'next'
import Head from 'next/head'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { useGetOrdersQuery } from '@/services'
import { OrderSkeleton } from '@/components/skeleton'
import { OrderCard } from '@/components/order'
import { Pagination } from '@/components/navigation'
import { IPagination } from '@/types'
import { useAppSelector } from '@/hooks'

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}

const OrderPage: NextPage = () => {
  // ? Assets
  const { query } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Get Orders Data
  const { data, ...ordersQueryProps } = useGetOrdersQuery({
    pageSize: 8,
    page: query.page ? +query.page : 1,
  })
  return (
    <main id="profileOrders">
      <MetaTags
        title={'پروفایل' + ' | ' + 'تاریخچه سفارشات'}
        description={generalSetting?.shortIntroduction || 'توضیحاتی فروشگاه اینترنتی'}
        keywords={generalSetting?.googleTags || ' اینترنتی, فروشگاه'}
      />
      <Header />
      <ProfileLayout isProfile>
        <PageContainer title="">
          <div className="flex w-full mt-4">
            {' '}
            <h3 className="pr-3 text-sm md:text-base mx-3 border border-[#e90089] w-full rounded-md py-4 flex justify-start items-center bg-[#fde5f3] text-[#e90089]">
              {'سفارش ها'}
            </h3>
          </div>

          {/* order tabs :  */}
          <div className=" px-2.5 pt-3 sm:py-5 sm:px-0 pb-6">
            <Tab.Group className="sm:mx-4 mx-0">
              <Tab.List className="lg:flex grid grid-cols-2 md:grid-cols-3 flex-wrap gap-6 rounded-md bg-[#f7f5f8] py-3.5 px-5">
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        ' w-full hover:shadow-md md:w-[128px] mdx:w-[148px] rounded-md lg:flex  items-center justify-center py-2 text-sm sm:text-base  font-normal',
                        selected ? 'text-white bg-[#e90089] shadow ' : 'bg-[#eee] text-[#6b6b6b]'
                      )}
                    >
                      درانتظار پرداخت
                    </button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        ' w-full hover:shadow-md md:w-[128px] mdx:w-[148px] rounded-md lg:flex  items-center justify-center py-2 text-sm sm:text-base  font-normal',
                        selected ? 'text-white bg-[#e90089] shadow ' : 'bg-[#eee] text-[#6b6b6b]'
                      )}
                    >
                      جاری
                    </button>
                  )}
                </Tab>

                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        ' w-full hover:shadow-md md:w-[128px] mdx:w-[148px] rounded-md lg:flex  items-center justify-center py-2 text-sm sm:text-base  font-normal',
                        selected ? 'text-white bg-[#e90089] shadow ' : 'bg-[#eee] text-[#6b6b6b]'
                      )}
                    >
                      تحویل شده
                    </button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        ' w-full hover:shadow-md md:w-[128px] mdx:w-[148px] rounded-md lg:flex  items-center justify-center py-2 text-sm sm:text-base  font-normal',
                        selected ? 'text-white bg-[#e90089] shadow ' : 'bg-[#eee] text-[#6b6b6b]'
                      )}
                    >
                      مرجوعی
                    </button>
                  )}
                </Tab>
                <Tab as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={classNames(
                        ' w-full hover:shadow-md md:w-[128px] mdx:w-[148px] rounded-md lg:flex  items-center justify-center py-2 text-sm sm:text-base  font-normal',
                        selected ? 'text-white bg-[#e90089] shadow ' : 'bg-[#eee] text-[#6b6b6b]'
                      )}
                    >
                      لغو شده
                    </button>
                  )}
                </Tab>
              </Tab.List>
              <Tab.Panels className="mt-6">
                <Tab.Panel className={classNames('bg-white', 'bg-opacity-100')}>
                  <div className="text-gray-700">
                    {' '}
                    <DataStateDisplay
                      {...ordersQueryProps}
                      dataLength={data && data.data ? data?.data?.ordersLength : 0}
                      emptyComponent={<EmptyOrdersList />}
                      loadingComponent={<OrderSkeleton />}
                    >
                      <div className="space-y-3">
                        {data?.data?.pagination?.data &&
                          data?.data?.pagination?.data
                            .filter((item) => item.paid === false && item.status === 1)
                            .map((item) => <OrderCard isProcessPay key={item.id} order={item} />)}
                      </div>
                    </DataStateDisplay>
                  </div>
                </Tab.Panel>
                <Tab.Panel className={classNames('bg-white', 'bg-opacity-100')}>
                  <div className="text-gray-700">
                    {' '}
                    <DataStateDisplay
                      {...ordersQueryProps}
                      dataLength={data && data.data ? data?.data?.ordersLength : 0}
                      emptyComponent={<EmptyOrdersList />}
                      loadingComponent={<OrderSkeleton />}
                    >
                      <div className="space-y-3">
                        {data?.data?.pagination?.data &&
                          data?.data?.pagination?.data
                            .filter((item) => item.paid === true && item.status === 2)
                            .map((item) => <OrderCard isCurrently key={item.id} order={item} />)}
                      </div>
                    </DataStateDisplay>
                  </div>
                </Tab.Panel>

                <Tab.Panel className={classNames('bg-white', 'bg-opacity-100')}>
                  <div className="text-gray-700">
                    {' '}
                    <DataStateDisplay
                      {...ordersQueryProps}
                      dataLength={data && data.data ? data?.data?.ordersLength : 0}
                      emptyComponent={<EmptyOrdersList />}
                      loadingComponent={<OrderSkeleton />}
                    >
                      <div className="space-y-3">
                        {data?.data?.pagination?.data &&
                          data?.data?.pagination?.data
                            .filter((item) => item.delivered === true && item.status === 3)
                            .map((item) => <OrderCard isDelivered key={item.id} order={item} />)}
                      </div>
                    </DataStateDisplay>
                  </div>
                </Tab.Panel>
                <Tab.Panel className={classNames('bg-white', 'bg-opacity-100')}>
                  <div className="text-gray-700">
                    {' '}
                    <DataStateDisplay
                      {...ordersQueryProps}
                      dataLength={data && data.data ? data?.data?.ordersLength : 0}
                      emptyComponent={<EmptyOrdersList />}
                      loadingComponent={<OrderSkeleton />}
                    >
                      <div className="space-y-3">
                        {data?.data?.pagination?.data &&
                          data?.data?.pagination?.data
                            .filter((item) => item.status === 4)
                            .map((item) => <OrderCard isReturned key={item.id} order={item} />)}
                      </div>
                    </DataStateDisplay>
                  </div>
                </Tab.Panel>
                <Tab.Panel className={classNames('bg-white', 'bg-opacity-100')}>
                  <div className="text-gray-700">
                    {' '}
                    <DataStateDisplay
                      {...ordersQueryProps}
                      dataLength={data && data.data ? data?.data?.ordersLength : 0}
                      emptyComponent={<EmptyOrdersList />}
                      loadingComponent={<OrderSkeleton />}
                    >
                      <div className="space-y-3">
                        {data?.data?.pagination?.data &&
                          data?.data?.pagination?.data
                            .filter((item) => item.status === 5)
                            .map((item) => <OrderCard isCanceled key={item.id} order={item} />)}
                      </div>
                    </DataStateDisplay>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>

          {/* <EmptyOrdersList /> */}
          {/* {data && data?.data?.ordersLength! > 5 && (
            <div className="mx-auto py-4 lg:max-w-5xl">
              <Pagination pagination={data.data?.pagination!} section="profileOrders" client />
            </div>
          )} */}
        </PageContainer>
      </ProfileLayout>
    </main>
  )
}

export default OrderPage
