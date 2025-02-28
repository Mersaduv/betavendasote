import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm } from '@/types'
import {
  useCreateProductMutation,
  useGetSingleArticleQuery,
  useGetSingleOrderQuery,
  useUpdateOrderStatusMutation,
  useUpsertArticleMutation,
} from '@/services'
import { ArticleForm, ProductForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { Button, FullScreenLoading } from '@/components/ui'
import { useEffect, useState } from 'react'
import { ProtectedRouteWrapper } from '@/components/user'
import moment from 'moment-jalaali'
import { useAppSelector } from '@/hooks'

interface Props {}
const Edit: NextPage<Props> = () => {
  // ? Assets
  const { query, back, push, isReady } = useRouter()
  const id = query.id as string
  const status = Number(query.status)

  const [selectedStatus, setSelectedStatus] = useState(status)

  const dispatch = useDispatch()
  // ? Queries
  //*    Get Order
  const { refetch, data: selectedOrder, isLoading: isLoadingGetSelectedOrder } = useGetSingleOrderQuery({ id })
  const [
    updateOrderStatus,
    {
      isLoading: isLoadingUpdate,
      isSuccess: isSuccessLoadingUpdate,
      data: dataUpdate,
      error: errorUpdate,
      isError: isErrorUpdate,
    },
  ] = useUpdateOrderStatusMutation()
  const { generalSetting } = useAppSelector((state) => state.design)
  //*   Create Order

  // ? Handlers
  const updateHandler = (data: FormData) => {
    console.log(data, '==========data')

    refetch()
  }

  const onSuccess = () => {
    refetch() // این خط جدید
    // push(`/admin/orders/edit/${data?.data}`)
  }
  if (selectedOrder) {
    console.log(selectedOrder, 'selectedOrder')
  }

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(Number(event.target.value))
  }
  useEffect(() => {
    if (!isReady) return
    if (query.status) {
      setSelectedStatus(Number(query.status))
    }
  }, [query.status, isReady])
  let pageTitle = ''
  if (selectedStatus === 2 || selectedStatus === 21) {
    pageTitle = 'سفارش جدید'
  } else if (selectedStatus === 22) {
    pageTitle = 'در حال پردازش'
  } else if (selectedStatus === 23) {
    pageTitle = 'در حال بسته بندی'
  } else if (selectedStatus === 24) {
    pageTitle = 'در حال ارسال'
  } else if (selectedStatus === 3) {
    pageTitle = 'تکمیل شده'
  } else if (selectedStatus === 4) {
    pageTitle = 'مرجوع شده'
  } else if (selectedStatus === 5) {
    pageTitle = 'لغو شده'
  } else {
    pageTitle = 'سفارش' // مقدار پیش فرض در صورت عدم تطابق
  }

  const handleUpdateOrderStatus = () => {
    if (selectedOrder?.data?.id) {
      updateOrderStatus({ id: selectedOrder?.data?.id, status: selectedStatus })
    }
  }
  return (
    <ProtectedRouteWrapper>
      <>
        {(isSuccessLoadingUpdate || isErrorUpdate) && (
          <HandleResponse
            isError={isErrorUpdate}
            isSuccess={isSuccessLoadingUpdate}
            error={errorUpdate}
            message={dataUpdate?.message}
            onSuccess={onSuccess}
          />
        )}

        <main>
          <Head>
            <title>{pageTitle}</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full h-screen p-7  px-4 mx-2">
              <div className="bg-white w-full rounded-md shadow-item">
                <div className="flex justify-between items-center p-4">
                  <h1>{pageTitle}</h1>
                  <div className="flex gap-4">
                    <Button onClick={handleUpdateOrderStatus} className="bg-sky-500 p-0 h-[42px] text-sm w-[90px]">
                      بروزرسانی
                    </Button>
                    <div className={`flex w-[280px]  flex-col xs:flex-row`}>
                      <label
                        htmlFor="status"
                        className="flex items-center justify-center xs:py-0 py-2 px-4 rounded-l-none rounded-md bg-[#f5f8fa]"
                      >
                        <span className="whitespace-nowrap text-center">وضعیت</span>
                      </label>
                      <select
                        className={`w-full text-start rounded-md rounded-r-none border border-gray-300`}
                        id="status"
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                      >
                        <option value={21}>سفارش جدید</option>
                        <option value={22}>در حال پردازش</option>
                        <option value={23}>در حال بسته بندی </option>
                        <option value={24}>در حال ارسال</option>
                        <option value={3}>تکمیل شده</option>
                        <option value={4}>مرجوع شده</option>
                        <option value={5}>لغو شده</option>
                        <option value={6}>زباله دان</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#e8fff3] p-4 m-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-[#a1a5b7] pl-2">کد سفارش</span>{' '}
                    <span className="farsi-digits">{selectedOrder?.data?.orderNum}</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">شماره کاربری</span>{' '}
                    <span className="farsi-digits">{selectedOrder?.data?.user.mobileNumber}</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">نام خریدار</span>{' '}
                    <span className="farsi-digits">{selectedOrder?.data?.address.fullName}</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">تاریخ خرید</span>{' '}
                    <span className="farsi-digits">
                      {moment(selectedOrder?.data?.dateOfPayment).format('jYYYY/jMM/jDD')}
                    </span>
                  </div>
                </div>

                <hr className="py-4" />

                <div className="px-4">
                  <table className="w-[780px] md:w-full mx-auto">
                    <thead className="bg-sky-300">
                      <tr>
                        <th className="text-sm py-3 px-2 font-normal w-[130px] text-start text-gray-600 ">عکس</th>
                        <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">محصول</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal whitespace-nowrap">کد محصول </th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">دسته بندی </th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">فروشنده</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">قیمت</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">تعداد</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">جمع قیمت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder?.data?.cart.map((orderItem) => {
                        return (
                          <tr key={orderItem.itemID} className={`h-16 border-b `}>
                            <td className="text-center text-sm text-gray-600 farsi-digits">
                              <img className="w-16 rounded-md" src={orderItem?.img.imageUrl} alt="تصویر آیتم" />
                            </td>

                            <td className="text-center text-sm text-gray-600 farsi-digits">{orderItem.name}</td>

                            <td className="text-center text-sm text-gray-600 farsi-digits">{orderItem.productCode}</td>

                            <td className="text-center text-sm text-gray-600 farsi-digits">
                              {orderItem.productCategory}
                            </td>

                            <td className="text-center text-sm text-gray-600 farsi-digits">{generalSetting?.title}</td>

                            <td className={`text-center text-sm farsi-digits`}>{orderItem.price} تومان</td>

                            <td className="text-center text-sm text-gray-600 farsi-digits">{orderItem.quantity}</td>
                            <td className="text-center text-sm text-gray-600 farsi-digits">
                              {orderItem.price * orderItem.quantity} تومان
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <hr className=" mt-6" />

                <div className="p-4">
                  <div className="flex items-center">
                    <span className="text-[#a1a5b7] pl-2">جمع کل</span>{' '}
                    <span className="farsi-digits">{selectedOrder?.data?.totalPrice} تومان</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">حمل و نقل</span>{' '}
                    <span className="farsi-digits">50000 تومان</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2"> کادوپیج</span>{' '}
                    <span className="farsi-digits">50000 تومان</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">مبلغ قابل پرداخت</span>{' '}
                    <span className="farsi-digits">
                      {selectedOrder?.data?.totalPrice && selectedOrder?.data?.totalPrice + 100000} تومان
                    </span>
                  </div>
                </div>

                <hr className="" />

                <div className="p-4">
                  <div className="flex items-center">
                    <span className="text-[#a1a5b7] pl-2">وضعیت پرداخت</span>{' '}
                    {selectedOrder?.data?.paid ? (
                      <span className="text-[#50cd89] text-sm font-semibold">پرداخت شده</span>
                    ) : (
                      <span className="farsi-digits">پرداخت نشده</span>
                    )}
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">شماره کارت</span>{' '}
                    <span className="farsi-digits"> 6219861011111111</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2">کد پیگیری</span> <span className="farsi-digits">123465</span>
                    <span className="text-[#a1a5b7] mx-2">•</span>
                    <span className="text-[#a1a5b7] pl-2"> تاریخ پرداخت</span>{' '}
                    <span className="farsi-digits">
                      {moment(selectedOrder?.data?.dateOfPayment).format('jYYYY/jMM/jDD')}
                    </span>
                  </div>
                </div>

                <hr />

                <div className="p-4">
                  <div className="flex flex-col gap-1">
                    <div>
                      <span className="text-[#a1a5b7] pl-2">نام گیرنده</span>{' '}
                      <span className="farsi-digits">{selectedOrder?.data?.address.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[#a1a5b7] pl-2">آدرس</span>{' '}
                      <span className="farsi-digits">{selectedOrder?.data?.address.fullAddress}</span>
                    </div>
                    <div>
                      <span className="text-[#a1a5b7] pl-2">یادداشت</span>{' '}
                      <span className="farsi-digits">{selectedOrder?.data?.note}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Edit), { ssr: false })
