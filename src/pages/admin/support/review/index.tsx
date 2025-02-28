import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, ReviewTabDashboardLayout, SupportTabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import { useGetReviewsQuery, useGetTicketsQuery } from '@/services'
import { useRouter } from 'next/router'
import { ITicket, UserTypes } from '@/types'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetTicketsResult } from '@/services/user/types'
import moment from 'moment-jalaali'
import { GetReviewsResultPagination } from '@/services/review/types'
const Review: NextPage = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewTabKey, setReviewTabKey] = useState('allReviews')
  const [userType, setUserType] = useState('')
  const [selectUserTypeState, setSelectUserTypeState] = useState<string | undefined>(undefined)
  // ? Assets
  const { query, push } = useRouter()
  const reviewPage = query.page ? +query.page : 1
  // ? tickets Query
  const [reviewsPagination, setReviewsPagination] = useState<GetReviewsResultPagination>()
  const [reviewsAwaitingPagination, setReviewsAwaitingPagination] = useState<GetReviewsResultPagination>()
  const [reviewsApprovalPagination, setReviewsApprovalPagination] = useState<GetReviewsResultPagination>()
  const [reviewsRejectedPagination, setReviewsRejectedPagination] = useState<GetReviewsResultPagination>()

  const useFetchReviews = (status?: string) => {
    const commonReviewQueryParams = {
      pageSize: 8,
      page: reviewPage,
      search: searchTerm,
      status: status,
      adminList: true,
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetReviewsQuery({ ...commonReviewQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allReview,
    isError: isAllReviewError,
    isFetching: isAllReviewFetching,
    isSuccess: isAllReviewSuccess,
    refetch: refetchAllReview,
  } = useFetchReviews()

  const {
    data: awaitingReview,
    isError: isAwaitingReviewError,
    isFetching: isAwaitingReviewFetching,
    isSuccess: isAwaitingReviewSuccess,
    refetch: refetchAwaitingReview,
  } = useFetchReviews('1')

  const {
    data: approvalReview,
    isError: isApprovalReviewError,
    isFetching: isApprovalReviewFetching,
    isSuccess: isApprovalReviewSuccess,
    refetch: refetchApprovalReview,
  } = useFetchReviews('2')

  const {
    data: rejectedReview,
    isError: isRejectedReviewError,
    isFetching: isRejectedReviewFetching,
    isSuccess: isRejectedReviewSuccess,
    refetch: refetchRejectedReview,
  } = useFetchReviews('3')

  useEffect(() => {
    if (allReview) {
      setReviewsPagination(allReview)
    }
  }, [allReview])

  useEffect(() => {
    if (awaitingReview) {
      setReviewsAwaitingPagination(awaitingReview)
    }
  }, [awaitingReview])

  useEffect(() => {
    if (approvalReview) {
      setReviewsApprovalPagination(approvalReview)
    }
  }, [approvalReview])

  useEffect(() => {
    if (rejectedReview) {
      setReviewsRejectedPagination(rejectedReview)
    }
  }, [rejectedReview])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleChangeUserType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(event.target.value)
  }

  const handleInStockClick = () => {
    setSelectUserTypeState(userType)
  }

  return (
    <ProtectedRouteWrapper>
      <>
        <DashboardLayout>
          <ReviewTabDashboardLayout>
            <Head>
              <title>دیدگاهای محصول</title>
            </Head>

            <div id="_adminReviews">
              <div className="">
                <Tab.Group
                  selectedIndex={
                    reviewTabKey === 'allReviews'
                      ? 0
                      : reviewTabKey === 'awaitingReviews'
                      ? 1
                      : reviewTabKey === 'approvalReviews'
                      ? 2
                      : reviewTabKey === 'rejectedReviews'
                      ? 3
                      : 0
                  }
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setReviewTabKey('allReviews')
                        break
                      case 1:
                        setReviewTabKey('awaitingReviews')
                        break
                      case 2:
                        setReviewTabKey('approvalReviews')
                        break
                      case 3:
                        setReviewTabKey('rejectedReviews')
                        break
                      default:
                        setReviewTabKey('allReviews')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col md:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">دیدگاه محصول</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(reviewsPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          در انتظار تایید ({digitsEnToFa(reviewsAwaitingPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          تایید شده ({digitsEnToFa(reviewsApprovalPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          رد شده ({digitsEnToFa(reviewsRejectedPagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
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
                  <Tab.Panels className="mt-3 rounded-xl bg-white p-3">
                    <Tab.Panel>
                      <div id="_adminAll">
                        <DataStateDisplay
                          isError={isAllReviewError}
                          refetch={refetchAllReview}
                          isFetching={isAllReviewFetching}
                          isSuccess={isAllReviewSuccess}
                          dataLength={reviewsPagination?.data?.data ? reviewsPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">تاریخ</th>

                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">
                                  شماره کاربری
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد محصول</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نام محصول</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviewsPagination?.data?.data &&
                                reviewsPagination?.data?.data.map((review, index) => {
                                  console.log(review)
                                  return (
                                    <tr
                                      key={review.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-center farsi-digits">
                                        {' '}
                                        {moment(review.created).format('jYYYY/jMM/jDD HH:mm')}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">{review.mobileNumber}</td>
                                      <td className="text-sm text-center farsi-digits">{review.product.code}</td>
                                      <td className="text-sm text-center">{review.product.title}</td>
                                      <td className="text-sm text-center">
                                        {review.status == 1 ? (
                                          <div className=" text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            در انتظار تایید
                                          </div>
                                        ) : review.status == 3 ? (
                                          <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            بسته
                                          </div>
                                        ) : (
                                          <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            تایید شده
                                          </div>
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
                                                        push(`/admin/support/messages/review/${review.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>بررسی</span>
                                                    </button>
                                                    <button
                                                      //   onClick={() => {
                                                      //     push(`/admin/support/messages/review/${review.id}`)
                                                      //     close()
                                                      //   }}
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

                        {/* {reviewsPagination?.data?.data &&
                          reviewsPagination?.data?.data?.length > 0 &&
                          reviewsPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={reviewsPagination?.data} section="_adminTickets" client />
                            </div>
                          )} */}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminPendingApproval"></div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminApproved"></div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminRejected"></div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </ReviewTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Review), { ssr: false })
