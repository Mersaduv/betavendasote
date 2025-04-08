import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import { useDeleteBrandMutation, useGetBrandsQuery } from '@/services'
import { useRouter } from 'next/router'
import { IBrand, ICoupon } from '@/types'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { BrandModal, ConfirmDeleteModal } from '@/components/modals'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { showAlert } from '@/store'
import { GetBrandsResult } from '@/services/brand/types'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetCouponsResult } from '@/services/product/types'
import Link from 'next/link'

const fakeCoupons = [
  {
    id: '1',
    couponCode: 'OFF50',
    name: 'تخفیف 50%',
    description: 'ویژه خریدهای بالای 200 هزار تومان',
    isActive: true,
    limit: 100,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    discountRate: 50,
    minOrderAmount: 200000,
    maxDiscountAmount: 50000,
  },
  {
    id: '2',
    couponCode: 'SAVE30',
    name: 'تخفیف 30%',
    description: 'مخصوص کاربران جدید',
    isActive: false,
    limit: 50,
    startDate: '2025-02-01',
    endDate: '2025-08-31',
    discountRate: 30,
    minOrderAmount: 100000,
    maxDiscountAmount: 30000,
  },
  {
    id: '3',
    couponCode: 'FREESHIP',
    name: 'ارسال رایگان',
    description: 'برای سفارش‌های بالای 500 هزار تومان',
    isActive: true,
    limit: 200,
    startDate: '2025-03-01',
    endDate: '2025-10-01',
    discountRate: 100,
    minOrderAmount: 500000,
    maxDiscountAmount: 40000,
  },
]

const Coupon: NextPage = () => {
  // States
  const [isShowCouponModal, couponModalHandlers] = useDisclosure()
  const [isShowEditCouponModal, editCouponModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateCoupon, setStateCoupon] = useState<ICoupon>()
  const [couponTabKey, setCouponTabKey] = useState('allCoupons')

  // ? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const couponPage = query.page ? +query.page : 1
  // ? coupons Query
  const [couponsPagination, setCouponsPagination] = useState<GetCouponsResult>()
  const [couponsActivePagination, setCouponsActivePagination] = useState<GetCouponsResult>()
  const [couponsInActivePagination, setCouponsInActivePagination] = useState<GetCouponsResult>()
  const [couponsIsDeletedPagination, setCouponsIsDeletedPagination] = useState<GetCouponsResult>()

  // const useFetchCoupons = (status: string) => {
  //   const commonCouponQueryParams = {
  //     pageSize: 8,
  //     page: couponPage,
  //     search: searchTerm,
  //     isActive: status === 'isActive',
  //     inActive: status === 'inActive',
  //     isDeleted: status === 'isDeleted',
  //     isActiveSlider: status === 'isActiveSlider',
  //   }

  //   const { data, isError, isFetching, isSuccess, refetch } = useGetCouponsQuery({ ...commonCouponQueryParams })

  //   return {
  //     data,
  //     isError,
  //     isFetching,
  //     isSuccess,
  //     refetch,
  //   }
  // }

  // const {
  //   data: allCoupons,
  //   isError: isAllCouponsError,
  //   isFetching: isAllCouponsFetching,
  //   isSuccess: isAllCouponsSuccess,
  //   refetch: refetchAllCoupons,
  // } = useFetchCoupons('allCoupons')

  // const {
  //   data: activeCoupons,
  //   isError: isActiveCouponsError,
  //   isFetching: isActiveCouponsFetching,
  //   isSuccess: isActiveCouponsSuccess,
  //   refetch: refetchActiveCoupons,
  // } = useFetchCoupons('isActive')

  // const {
  //   data: inactiveCoupons,
  //   isError: isInactiveCouponsError,
  //   isFetching: isInactiveCouponsFetching,
  //   isSuccess: isInactiveCouponsSuccess,
  //   refetch: refetchInactiveCoupons,
  // } = useFetchCoupons('inActive')

  // const {
  //   data: deletedCoupons,
  //   isError: isDeletedCouponsError,
  //   isFetching: isDeletedCouponsFetching,
  //   isSuccess: isDeletedCouponsSuccess,
  //   refetch: refetchDeletedCoupons,
  // } = useFetchCoupons('isDeleted')

  // useEffect(() => {
  //   if (allCoupons) {
  //     setCouponsPagination(allCoupons)
  //   }
  // }, [allCoupons])

  // useEffect(() => {
  //   if (activeCoupons) {
  //     setCouponsActivePagination(activeCoupons)
  //   }
  // }, [activeCoupons])

  // useEffect(() => {
  //   if (inactiveCoupons) {
  //     setCouponsInActivePagination(inactiveCoupons)
  //   }
  // }, [inactiveCoupons])

  // useEffect(() => {
  //   if (deletedCoupons) {
  //     setCouponsIsDeletedPagination(deletedCoupons)
  //   }
  // }, [deletedCoupons])
  //*    Delete
  // const [
  //   deleteCoupon,
  //   {
  //     isSuccess: isSuccessDelete,
  //     isError: isErrorDelete,
  //     error: errorDelete,
  //     data: dataDelete,
  //     isLoading: isLoadingDelete,
  //   },
  // ] = useDeleteCouponMutation()

  const handleChangePage = (id: string) => {
    push(`/admin/products?coupons=${id}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlerEditCouponModal = (coupon: ICoupon) => {
    setStateCoupon(coupon)
    editCouponModalHandlers.open()
  }

  //*   Delete Handlers
  const handleDelete = (coupon: ICoupon) => {
    // if (coupon.count !== 0) {
    //   return dispatch(
    //     showAlert({
    //       status: 'error',
    //       title: 'برند مد نظر دارایی محصول مرتبط است',
    //     })
    //   )
    // } else {
    //   setDeleteInfo({ id: coupon.id })
    //   confirmDeleteModalHandlers.open()
    // }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    // deleteCoupon({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    handleAllRefetch()
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  const handleAllRefetch = () => {
    // refetchAllCoupons()
    // refetchInactiveCoupons()
    // refetchActiveCoupons()
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {/* Handle Delete Response */}
        {/* {(isSuccessDelete || isErrorDelete) && (
          <HandleResponse
            isError={isErrorDelete}
            isSuccess={isSuccessDelete}
            error={errorDelete}
            message={dataDelete?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )} */}

        {/* <ConfirmDeleteModal
          deleted
          title="کوپن"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirm}
        /> */}

        <DashboardLayout>
            <Head>
              <title>تخفیفات</title>
            </Head>

            <div id="_adminCoupons" className="w-full">
              <div className="mx-3 bg-white rounded-xl shadow-item w-full mt-7">
                <Tab.Group
                  selectedIndex={
                    couponTabKey === 'allCoupons'
                      ? 0
                      : couponTabKey === 'activeCoupons'
                      ? 1
                        : couponTabKey === 'inactiveCoupons'
                        ? 2
                        : couponTabKey === 'isDeletedCoupons'
                        ? 3
                        : 0
                    }
                    onChange={(index) => {
                      switch (index) {
                        case 0:
                          setCouponTabKey('allCoupons')
                          break
                        case 1:
                          setCouponTabKey('activeCoupons')
                          break
                        case 2:
                          setCouponTabKey('inactiveCoupons')
                          break
                        case 3:
                          setCouponTabKey('isDeletedCoupons')
                          break
                        default:
                          setCouponTabKey('allCoupons')
                      }
                    }}
                  >
                    <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto w-full">
                      <div className="flex flex-col items-start justify-center">
                        <h2 className="pr-4 pb-2">تخفیفات</h2>
                        <div className="flex items-center">
                          <Tab
                            className={({ selected }) =>
                              `whitespace-nowrap ${
                                selected ? 'text-sky-500' : 'hover:text-sky-500'
                              } px-4 py-2 rounded cursor-pointer text-sm`
                            }
                          >
                            همه ({digitsEnToFa(couponsPagination?.data?.totalCount ?? 0)})
                          </Tab>
                          <Tab
                            className={({ selected }) =>
                              `whitespace-nowrap ${
                                selected ? 'text-sky-500' : 'hover:text-sky-500'
                              } px-4 py-2 rounded cursor-pointer text-sm`
                            }
                          >
                            فعال ({digitsEnToFa(couponsActivePagination?.data?.totalCount ?? 0)})
                          </Tab>
                          <Tab
                            className={({ selected }) =>
                              `whitespace-nowrap ${
                                selected ? 'text-sky-500' : 'hover:text-sky-500'
                              } px-4 py-2 rounded cursor-pointer text-sm`
                            }
                          >
                            غیرفعال ({digitsEnToFa(couponsInActivePagination?.data?.totalCount ?? 0)})
                          </Tab>
                          <Tab
                            className={({ selected }) =>
                              `whitespace-nowrap ${
                                selected ? 'text-sky-500' : 'hover:text-sky-500'
                              } px-4 py-2 rounded cursor-pointer text-sm`
                            }
                          >
                            زباله دان ({digitsEnToFa(couponsIsDeletedPagination?.data?.totalCount ?? 0)})
                          </Tab>
                        </div>
                      </div>{' '}
                      <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                        <div className="flex flex-col xs:flex-row items-center gap-4">
                          <Link
                            href="/admin/ads/coupon/new"
                            className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap rounded-lg text-white"
                          >
                            افزودن کوپن
                          </Link>
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
                    </Tab.List>
                    <Tab.Panels className="mt-3 rounded-xl bg-white p-3  w-full">
                      <Tab.Panel className={"w-full"}>
                        <div id="_adminBrandsAll  w-full">
                          {/* <DataStateDisplay
                            isError={isAllCouponsError}
                            refetch={refetchAllCoupons}
                            isFetching={isAllCouponsFetching}
                            isSuccess={isAllCouponsSuccess}
                            dataLength={couponsPagination?.data?.data ? couponsPagination.data?.data.length : 0}
                            loadingComponent={<TableSkeleton count={20} />}
                          >
                            <table className="w-[700px] md:w-full mx-auto">
                              <thead className="bg-sky-300">
                                <tr>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">نام کوپن</th>
                                  <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                    کد کوپن
                                  </th>
                                  <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                    توضیحات
                                  </th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                  <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {couponsPagination?.data?.data &&
                                  couponsPagination?.data?.data.map((coupon, index) => {
                                    return (
                                      <tr
                                        key={coupon.id}
                                        className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                      >
                                        <td className="text-center">
                                          <div className="text-sm  px-2">{coupon.name}</div>
                                        </td>
                                        <td className="">
                                          <div
                                            onClick={() => handlerEditCouponModal(coupon)}
                                            className="text-sm text-sky-500 cursor-pointer px-2"
                                          >
                                            {coupon.couponCode}
                                          </div>
                                        </td>

                                        <td className="text-center">
                                          <div className="text-sm  px-2">{coupon.description}</div>
                                        </td>
                                        <td className="text-center">
                                          <div>
                                            {coupon.isActive ? (
                                              <span className="text-sm text-green-500  px-1.5 rounded">فعال</span>
                                            ) : (
                                              <span className="text-sm text-red-500 px-1.5 rounded ">غیر فعال</span>
                                            )}
                                          </div>
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
                                                          handleDelete(coupon)
                                                          close()
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

                          {couponsPagination?.data?.data &&
                            couponsPagination?.data?.data?.length > 0 &&
                            couponsPagination.data?.data && (
                              <div className="mx-auto py-4 lg:max-w-5xl">
                                <Pagination pagination={couponsPagination?.data} section="_adminCoupons" client />
                              </div>
                            )} */}

                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">نام کوپن</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد کوپن</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-start">توضیحات</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fakeCoupons.map((coupon, index) => (
                                <tr key={coupon.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                  <td className="text-center px-2 text-sm">{coupon.name}</td>
                                  <td className="text-center px-2 text-sm">
                                    {coupon.couponCode}
                                  </td>
                                  <td className="text-start px-2 text-sm">
                                    {coupon.description === ' ' ? '-' : coupon.description}
                                  </td>
                                  <td className="text-center text-sm">
                                    {coupon.isActive ? (
                                      <span className="text-green-500">فعال</span>
                                    ) : (
                                      <span className="text-red-500">غیرفعال</span>
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
                                                    handleDelete(coupon)
                                                    close()
                                                  }}
                                                  className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                >
                                                  <span>ویرایش</span>
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handleDelete(coupon)
                                                    close()
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Tab.Panel>

                      <Tab.Panel>
                        <div id="_adminActiveCoupons"></div>
                      </Tab.Panel>

                      <Tab.Panel>
                        <div id="_adminInActiveCoupons"></div>
                      </Tab.Panel>

                      <Tab.Panel>
                        <div id="_adminIsDeletedCoupons"></div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
          </DashboardLayout>
        </>
      </ProtectedRouteWrapper>
    )
  }

  export default dynamic(() => Promise.resolve(Coupon), { ssr: false })
