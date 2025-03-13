import Head from 'next/head'
import dynamic from 'next/dynamic'
import { AmountAndCostTabsDashboardLayout, DashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { useDeleteEditPriceMutation, useGetEditPricesQuery, useGetTicketsQuery } from '@/services'
import { useRouter } from 'next/router'
import { ITicket } from '@/types'
import { useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetTicketsResult } from '@/services/user/types'
import { Menu, Transition } from '@headlessui/react'
import { TableSkeleton } from '@/components/skeleton'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import moment from 'moment-jalaali'
import { Pagination } from '@/components/navigation'
import { CategoryDetailModal, ConfirmDeleteModal } from '@/components/modals'
const AmountAndCost: NextPage = () => {
  // States
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  // ? Assets
  const { query, push } = useRouter()
  const page = query.page ? +query.page : 1

  const {
    data: editPriceData,
    isFetching: isEditPriceFetching,
    isError: isEditPriceError,
    isSuccess: isEditPriceSuccess,
    refetch: refetchEditPrice,
  } = useGetEditPricesQuery({
    pageSize: 8,
    page: page,
    search: searchTerm,
    adminList: true,
  })

  const [deleteEditPrice, { isLoading: isDeleteEditPriceLoading, isError: isDeleteEditPriceError, isSuccess: isDeleteEditPriceSuccess, error: deleteEditPriceError, data: deleteEditPriceData }] = useDeleteEditPriceMutation()



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const onConfirmDelete = () => {
    deleteEditPrice({ id: deleteInfo.id })
  }
  const handleDelete = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }
  const onSuccess = () => {
    confirmDeleteModalHandlers.close()

    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onCancel = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  return (
    <ProtectedRouteWrapper>
      <>

      <ConfirmDeleteModal
          deleted
          title="حذف ویرایش قیمت"
          isLoading={isDeleteEditPriceLoading}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmDelete}
        />

        {(isDeleteEditPriceSuccess || isDeleteEditPriceError) && (
          <HandleResponse
            isError={isDeleteEditPriceError}
            isSuccess={isDeleteEditPriceSuccess}
            error={deleteEditPriceError}
            message={deleteEditPriceData?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        <DashboardLayout>
          <AmountAndCostTabsDashboardLayout>
            <Head>
              <title>تیکت ها</title>
            </Head>

            <div id="_admin">
              <div className="">
                <div className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                  <div className="flex flex-col items-start justify-center">
                    <h2 className="pr-4 pb-2">ویرایش جمعی قیمت</h2>
                  </div>{' '}
                  <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                    <div className="flex flex-col xs:flex-row items-center gap-4">
                      <Button
                        onClick={() => push('/admin/amount-and-cost/edit-price/new')}
                        className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                      >
                        ویرایش جدید
                      </Button>

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
                </div>
                <div className="mt-3 rounded-xl bg-white p-3 overflow-auto">
                  <div id="_adminTicketsAll">
                    <DataStateDisplay
                      isError={isEditPriceError}
                      refetch={refetchEditPrice}
                      isFetching={isEditPriceFetching}
                      isSuccess={isEditPriceSuccess}
                      dataLength={editPriceData?.data?.data?.length ?? 0}
                      loadingComponent={<TableSkeleton count={20} />}
                    >
                      <table className="w-[700px] md:w-full mx-auto">
                        <thead className="bg-sky-300">
                          <tr>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">تاریخ</th>
                            <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">دسته بندی</th>
                            <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">وضعیت</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نوع محصول</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">مبلغ/درصد</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editPriceData?.data?.data &&
                            editPriceData?.data?.data.map((editPrice, index) => {
                              console.log(editPrice, 'editPrice')
                              return (
                                <tr
                                  key={editPrice.id}
                                  className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                >
                                  <td className="text-sm text-center farsi-digits">
                                    {moment(editPrice.created).format('jYYYY/jMM/jDD HH:mm')}
                                  </td>
                                  <td className="text-sm text-center farsi-digits">
                                    <CategoryDetailModal categories={editPrice.categories} />
                                  </td>
                                  <td className="text-center">
                                    {editPrice.isActive ? (
                                      <span className="text-sm text-green-500">فعال</span>
                                    ) : (
                                      <span className="text-sm text-red-500">غیر فعال</span>
                                    )}
                                  </td>
                                  <td className="text-sm text-center farsi-digits">
                                    {' '}
                                    {editPrice.productType === 0
                                      ? 'همه'
                                      : editPrice.productType === 0
                                      ? 'متغیر'
                                      : 'ساده'}
                                  </td>
                                  <td className="text-sm text-center">
                                    {editPrice.action == 0 ? (
                                      <div className="text-[#f1416c]  w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                        افزایش
                                      </div>
                                    ) : editPrice.action == 1 ? (
                                      <div className="text-green-500 w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                        کاهش
                                      </div>
                                    ) : (
                                      <div className="text-[#ffc700] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                        -
                                      </div>
                                    )}
                                  </td>
                                  {/* 
                                      <td className="text-sm text-center">
                                        <div className="text-sm text-sm  px-2">{ticket.nameEn}</div>
                                      </td>

                                      <td className="text-sm text-center">
                                        <div className="">{ticket.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      */}
                                  <td className="text-sm text-center farsi-digits">
                                    {editPrice.percentageValue > 0 ? (
                                      <span className="text-sm font-medium">{editPrice.percentageValue}%</span>
                                    ) : editPrice.priceValue > 0 ? (
                                      <span className="text-sm font-medium">{editPrice.priceValue}</span>
                                    ) : (
                                      <span className="text-sm font-medium">{editPrice.priceValue}</span>
                                    )}
                                  </td>
                                  <td className="text-center text-sm text-gray-600">
                                    <Menu as="div" className="dropdown">
                                      <Menu.Button className="">
                                        <div className="w-full flex justify-center items-center">
                                          <span className="text-2xl hover:bg-gray-300 cursor-pointer bg-gray-200 text-gray-700 p-1 pb-1.5 px-1.5 h-8 flex justify-center items-center rounded-md">
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
                                                <button
                                                  onClick={() => {
                                                    close()
                                                    handleDelete(editPrice.id)
                                                  }}
                                                  className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                >
                                                  <span>حذف</span>
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

                    {editPriceData?.data?.data && editPriceData?.data?.data?.length > 0 && editPriceData.data && (
                      <div className="mx-auto py-4 lg:max-w-5xl">
                        <Pagination pagination={editPriceData?.data} section="_adminEditPrice" client />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AmountAndCostTabsDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(AmountAndCost), { ssr: false })
