import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, SupportTabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import {
  useDeleteNotificationMutation,
  useDeleteSmsMessageMutation,
  useGetNotificationsQuery,
  useGetSmsMessageQuery,
  useGetTicketsQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { ITicket, UserTypes } from '@/types'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetNotificationsResult, GetSmsMessageResult, GetTicketsResult } from '@/services/user/types'
import moment from 'moment-jalaali'
import { ConfirmDeleteModal, UsersDetailModal } from '@/components/modals'
const SmsMessages: NextPage = () => {
  // States
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateNotification, setStateNotification] = useState<ITicket>()
  const [tabKey, setTabKey] = useState('allSms')
  const [userType, setUserType] = useState('')
  const [selectUserTypeState, setSelectUserTypeState] = useState<string | undefined>(undefined)

  // ? Assets
  const { query, push } = useRouter()
  const smsPage = query.page ? +query.page : 1
  // ? Query
  const [smsPagination, setSmsPagination] = useState<GetSmsMessageResult>()
  const [smsEventPagination, setSmsEventPagination] = useState<GetSmsMessageResult>()
  const [smsUrgentPagination, setSmsUrgentPagination] = useState<GetSmsMessageResult>()
  // const {
  //   data: brandData,
  //   refetch,
  //   ...brandsQueryProps
  // } = useGetBrandsQuery({
  //   pageSize: 20,
  //   page: brandPage,
  //   search: searchTerm,
  // })
  const useFetchSms = (status: string) => {
    const commonSmsQueryParams = {
      pageSize: 8,
      page: smsPage,
      search: searchTerm,
      userType: selectUserTypeState,
      status: status,
      adminList: true,
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetSmsMessageQuery({
      ...commonSmsQueryParams,
    })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allSms,
    isError: isAllSmsError,
    isFetching: isAllSmsIsFetching,
    isSuccess: isAllSmsSuccess,
    refetch: refetchAllSms,
  } = useFetchSms('')

  const {
    data: eventSms,
    isError: isEventSmsError,
    isFetching: isEventSmsFetching,
    isSuccess: isEventSmsSuccess,
    refetch: refetchEventSms,
  } = useFetchSms('1')

  const {
    data: urgentSms,
    isError: isUrgentSmsError,
    isFetching: isUrgentSmsFetching,
    isSuccess: isUrgentSmsSuccess,
    refetch: refetchUrgentSms,
  } = useFetchSms('2')

  useEffect(() => {
    if (allSms) {
      setSmsPagination(allSms)
    }
  }, [allSms])

  useEffect(() => {
    if (eventSms) {
      setSmsEventPagination(eventSms)
    }
  }, [eventSms])

  useEffect(() => {
    if (urgentSms) {
      setSmsUrgentPagination(urgentSms)
    }
  }, [urgentSms])
  const [
    deleteSmsMessage,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteSmsMessageMutation()
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleChangeUserType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(event.target.value)
  }

  const handleInStockClick = () => {
    setSelectUserTypeState(userType)
  }
  const onConfirmDelete = () => {
    deleteSmsMessage({ id: deleteInfo.id })
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
          title="حذف اعلان"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmDelete}
        />

        {(isSuccessDelete || isErrorDelete) && (
          <HandleResponse
            isError={isErrorDelete}
            isSuccess={isSuccessDelete}
            error={errorDelete}
            message={dataDelete?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        <DashboardLayout>
          <SupportTabDashboardLayout>
            <Head>
              <title>پیامک</title>
            </Head>

            <div id="_adminNotifications">
              <div className="">
                <Tab.Group
                  selectedIndex={tabKey === 'allSms' ? 0 : tabKey === 'eventSms' ? 1 : tabKey === 'urgentSms' ? 2 : 0}
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setTabKey('allSms')
                        break
                      case 1:
                        setTabKey('eventSms')
                        break
                      case 2:
                        setTabKey('urgentSms')
                        break
                      default:
                        setTabKey('allSms')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">پیامک</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(smsPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          مناسبتی ({digitsEnToFa(smsEventPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          فوری ({digitsEnToFa(smsUrgentPagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Button
                          onClick={() => push('/admin/support/messages/sms-list/new')}
                          className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                        >
                          پیامک جدید
                        </Button>
                        <div className="flex border w-fit rounded-lg">
                          <select
                            className="w-44 text-sm focus:outline-none appearance-none border-none rounded-r-lg"
                            name="انتخاب"
                            id=""
                            onChange={handleChangeUserType}
                          >
                            <option className="appearance-none text-sm" value="">
                              همه
                            </option>
                            <option value="0">مشتری</option>
                            <option value="1">پرسنل</option>
                            <option value="2">فروشنده</option>
                          </select>
                          <div
                            onClick={handleInStockClick}
                            className="bg-gray-100 hover:bg-gray-200 mr-[1px] rounded-l-md text-sm flex justify-center cursor-pointer items-center w-14 "
                          >
                            صافی
                          </div>
                        </div>
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
                  <Tab.Panels className="mt-3 rounded-xl bg-white p-3 overflow-auto">
                    <Tab.Panel>
                      <div id="_adminNotificationsAll">
                        <DataStateDisplay
                          isError={isAllSmsError}
                          refetch={refetchAllSms}
                          isFetching={isAllSmsIsFetching}
                          isSuccess={isAllSmsSuccess}
                          dataLength={smsPagination?.data?.data ? smsPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد پیامک</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">زمان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ارسال به
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نوع ارسال</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کاربران</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {smsPagination?.data?.data &&
                                smsPagination?.data?.data.map((smsItem, index) => {
                                  return (
                                    <tr
                                      key={smsItem.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-center farsi-digits">{smsItem.smsCode}</td>
                                      <td className="text-sm text-center farsi-digits">{smsItem.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        {moment(smsItem.created).format('jYYYY/jMM/jDD HH:mm')}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">
                                        {' '}
                                        {/* {smsItem.user.fullName === ' '
                                          ? smsItem.user.mobileNumber
                                          : smsItem.user.fullName} */}
                                        {smsItem.recipients[0].userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : smsItem.recipients[0].userSpecification.userType.toString() === '1'
                                          ? `پرسنل`
                                          : smsItem.recipients[0].userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      <td className="text-sm text-center">
                                        {smsItem.sendingTime == 1 ? (
                                          <div className="">فوری</div>
                                        ) : smsItem.sendingTime == 2 ? (
                                          <div className="">مناسبتی</div>
                                        ) : (
                                          <div className="">فوری</div>
                                        )}
                                      </td>
                                      <td className="text-sm text-center">
                                        <UsersDetailModal users={smsItem.recipients} />
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
                                                        push(`/admin/support/messages/sms-list/edit/${smsItem.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>ویرایش</span>
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(smsItem.id)
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

                        {smsPagination?.data?.data &&
                          smsPagination?.data?.data?.length > 0 &&
                          smsPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={smsPagination?.data} section="_adminNotification" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminEventNotification"></div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminUrgentNotification"></div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </SupportTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(SmsMessages), { ssr: false })
