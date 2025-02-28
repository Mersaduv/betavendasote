import { DashboardLayout, OrderTabDashboardLayout } from '@/components/Layouts'
import { ConfirmDeleteModal } from '@/components/modals'
import { Pagination } from '@/components/navigation'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { ProtectedRouteWrapper } from '@/components/user'
import { useDisclosure } from '@/hooks'
import { useDeleteTrashOrderMutation, useGetOrdersQuery } from '@/services'
import { Menu, Transition } from '@headlessui/react'
import moment from 'moment-jalaali'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import { LuSearch } from 'react-icons/lu'

const SendingOrders: NextPage = () => {
  // ? States
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteTrashInfo, setDeleteTrashInfo] = useState({
    id: '',
  })
  const [isShowConfirmTrashDeleteModal, confirmTrashDeleteModalHandlers] = useDisclosure()
  // ? Assets
  const { query, push } = useRouter()
  const orderPage = query.page ? +query.page : 1
  // ? Query
  const {
    data: ordersData,
    isError,
    isFetching,
    isSuccess,
    refetch,
  } = useGetOrdersQuery({
    pageSize: 8,
    page: orderPage,
    status: '24',
    search: searchTerm,
    adminList: true,
  })

  const [
    deleteTrashOrder,
    {
      isSuccess: isSuccessTrashDelete,
      isError: isErrorTrashDelete,
      error: errorTrashDelete,
      data: dataTrashDelete,
      isLoading: isLoadingTrashDelete,
    },
  ] = useDeleteTrashOrderMutation()
  // ? Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleDeleteTrash = (id: string) => {
    setDeleteTrashInfo({ id })
    confirmTrashDeleteModalHandlers.open()
  }

  const onConfirmTrashDelete = () => {
    deleteTrashOrder({ id: deleteTrashInfo.id })
  }
  const onCancel = () => {
    setDeleteTrashInfo({ id: '' })
    confirmTrashDeleteModalHandlers.close()
  }
  const onSuccess = () => {
    refetch()
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
  }
  const onError = () => {
    confirmTrashDeleteModalHandlers.close()
    setDeleteTrashInfo({ id: '' })
  }
  return (
    <ProtectedRouteWrapper>
      <>
        {/* Handle Delete Trash Order Response */}
        {(isSuccessTrashDelete || isErrorTrashDelete) && (
          <HandleResponse
            isError={isErrorTrashDelete}
            isSuccess={isSuccessTrashDelete}
            error={errorTrashDelete}
            message={dataTrashDelete?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        <ConfirmDeleteModal
          title="سفارش در زباله‌دان"
          isLoading={isLoadingTrashDelete}
          isShow={isShowConfirmTrashDeleteModal}
          onClose={confirmTrashDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmTrashDelete}
        />
        <main>
          <Head>
            <title>مدیریت سفارشات</title>
          </Head>
          <DashboardLayout>
            <OrderTabDashboardLayout>
              <section className="w-full flex flex-col">
                <div className="mx-3 bg-white rounded-xl shadow-item">
                  <div className="flex justify-between">
                    <h2 className="p-4 text-gray-600">درحال ارسال</h2>
                    {/* filter control  */}
                    <div className="flex justify-end px-4 gap-x-6 gap-y-2.5 flex-wrap py-4">
                      {/* search filter */}
                      <div className="flex border w-fit rounded-lg">
                        <label
                          htmlFor="search"
                          className="bg-gray-100 hover:bg-gray-200 ml-[1px] rounded-r-md flex justify-center cursor-pointer items-center w-14"
                        >
                          <LuSearch className="icon text-gray-500" />
                        </label>
                        <input
                          id="search"
                          type="text"
                          className="w-44 text-sm placeholder:text-center focus:outline-none appearance-none border-none rounded-l-lg"
                          placeholder="جستجو"
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div id="_adminOrder">
                    <DataStateDisplay
                      isError={isError}
                      refetch={refetch}
                      isFetching={isFetching}
                      isSuccess={isSuccess}
                      dataLength={ordersData?.data ? ordersData.data.ordersLength : 0}
                      loadingComponent={<TableSkeleton count={20} />}
                    >
                      <table className="w-[780px] md:w-full mx-auto">
                        <thead className="bg-sky-300">
                          <tr>
                            <th className="text-sm py-3 px-2 font-normal w-[130px] text-center text-gray-600 ">
                              تاریخ خرید{' '}
                            </th>
                            <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">کد سفارش</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">
                              شماره کاربری{' '}
                            </th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">
                              نام خریدار{' '}
                            </th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">ارسال به</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">کادوپیچ</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت مرسوله</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersData?.data &&
                            ordersData?.data?.pagination?.data?.map((order, index) => {
                              console.log(order, ' article.author')

                              return (
                                <tr key={order.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                  <td className="text-center text-sm text-gray-600 farsi-digits">
                                    {moment(order.dateOfPayment).format('jYYYY/jMM/jDD')}
                                  </td>

                                  <td className="text-center text-sm text-gray-600 farsi-digits">{order.orderNum}</td>

                                  <td className="text-center text-sm text-gray-600 farsi-digits">
                                    {order.address.mobileNumber}
                                  </td>

                                  <td className="text-center text-sm text-gray-600 farsi-digits">
                                    {order.address.fullName}
                                  </td>

                                  <td className="text-center text-sm text-gray-600 farsi-digits">
                                    {order.address.fullAddress !== '' ? order.address.province.name : '-'}
                                  </td>

                                  <td className="text-center text-sm text-gray-600 farsi-digits">
                                    {order.giftWrapped > 0 ? '✓' : '-'}
                                  </td>

                                  <td
                                    className={`text-center text-sm farsi-digits ${
                                      order.isDeleted
                                        ? 'text-[#f1416c]'
                                        : {
                                            21: 'text-[#ffc700]',
                                            2: 'text-[#ffc700]',
                                            22: 'text-[#009ef7]',
                                            23: 'text-[#7239ea]',
                                            24: 'text-[#ffc700]',
                                            3: 'text-[#50cd89]',
                                            4: 'text-[#f1416c]',
                                            5: 'text-[#f1416c]',
                                          }[order.status] || 'text-gray-600'
                                    }`}
                                  >
                                    {(() => {
                                      if (order.isDeleted) {
                                        return 'زباله دان'
                                      }
                                      switch (order.status) {
                                        case 1:
                                          return 'در انتظار پرداخت'
                                        case 21:
                                          return 'سفارش جدید'
                                        case 22:
                                          return 'درحال پردازش'
                                        case 23:
                                          return 'درحال بسته بندی'
                                        case 24:
                                          return 'درحال ارسال'
                                        case 3:
                                          return 'تکمیل شده'
                                        case 4:
                                          return 'مرجوعی شده'
                                          case 5:
                                          return 'لغو شده'
                                        default:
                                          return 'وضعیت نامشخص'
                                      }
                                    })()}
                                  </td>

                                  <td className="text-center text-sm text-gray-600">
                                    <Menu as="div" className="dropdown">
                                      <Menu.Button className="">
                                        <div className="w-full flex justify-center items-center">
                                          <span className="text-2xl hover:bg-gray-300 cursor-pointer  bg-gray-200 text-gray-700 p-1 pb-1.5 px-1.5 h-8 flex justify-center items-center rounded-md">
                                            :
                                          </span>
                                        </div>
                                      </Menu.Button>

                                      <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                      >
                                        <Menu.Items className="dropdown__items w-32 ">
                                          <Menu.Item>
                                            {({ close }) => (
                                              <>
                                                <Link
                                                  href={`/admin/orders/edit/${order.id}?status=${order.status}`}
                                                  onClick={close}
                                                  className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                >
                                                  <span>مشاهده</span>
                                                </Link>
                                                <button
                                                  onClick={() => {
                                                    handleDeleteTrash(order.id)
                                                    close()
                                                  }}
                                                  className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                >
                                                  <span>زباله دان</span>
                                                </button>
                                              </>
                                            )}
                                          </Menu.Item>
                                        </Menu.Items>
                                      </Transition>
                                    </Menu>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </DataStateDisplay>

                    {ordersData && ordersData.data && ordersData?.data && ordersData?.data?.ordersLength > 0 && (
                      <div className="mx-auto py-4 lg:max-w-5xl">
                        <Pagination pagination={ordersData.data.pagination} section="_adminOrder" client />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </OrderTabDashboardLayout>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}
export default dynamic(() => Promise.resolve(SendingOrders), { ssr: false })
