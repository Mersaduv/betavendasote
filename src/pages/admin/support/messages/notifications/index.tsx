import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, SupportTabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import { useDeleteNotificationMutation, useGetNotificationsQuery, useGetTicketsQuery } from '@/services'
import { useRouter } from 'next/router'
import { ITicket, UserTypes } from '@/types'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetNotificationsResult, GetTicketsResult } from '@/services/user/types'
import moment from 'moment-jalaali'
import { ConfirmDeleteModal } from '@/components/modals'
const Notification: NextPage = () => {
  // States
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateNotification, setStateNotification] = useState<ITicket>()
  const [notificationTabKey, setNotificationTabKey] = useState('allNotifications')
  const [userType, setUserType] = useState('')
  const [selectUserTypeState, setSelectUserTypeState] = useState<string | undefined>(undefined)

  // ? Assets
  const { query, push } = useRouter()
  const notificationPage = query.page ? +query.page : 1
  // ? tickets Query
  const [notificationsPagination, setNotificationsPagination] = useState<GetNotificationsResult>()
  const [notificationsEventPagination, setNotificationsEventPagination] = useState<GetNotificationsResult>()
  const [notificationsUrgentPagination, setNotificationsUrgentPagination] = useState<GetNotificationsResult>()
  // const {
  //   data: brandData,
  //   refetch,
  //   ...brandsQueryProps
  // } = useGetBrandsQuery({
  //   pageSize: 20,
  //   page: brandPage,
  //   search: searchTerm,
  // })
  const useFetchNotifications = (status: string) => {
    const commonNotificationQueryParams = {
      pageSize: 8,
      page: notificationPage,
      search: searchTerm,
      userType: selectUserTypeState,
      status: status,
      adminList: true,
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetNotificationsQuery({
      ...commonNotificationQueryParams,
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
    data: allNotifications,
    isError: isAllNotificationsError,
    isFetching: isAllNotificationsIsFetching,
    isSuccess: isAllNotificationsSuccess,
    refetch: refetchAllNotifications,
  } = useFetchNotifications('')

  const {
    data: eventNotifications,
    isError: isEventNotificationsError,
    isFetching: isEventNotificationsFetching,
    isSuccess: isEventNotificationsSuccess,
    refetch: refetchEventNotifications,
  } = useFetchNotifications('1')

  const {
    data: urgentNotifications,
    isError: isUrgentNotificationsError,
    isFetching: isUrgentNotificationsFetching,
    isSuccess: isUrgentNotificationsSuccess,
    refetch: refetchUrgentNotifications,
  } = useFetchNotifications('2')

  useEffect(() => {
    if (allNotifications) {
      setNotificationsPagination(allNotifications)
    }
  }, [allNotifications])

  useEffect(() => {
    if (eventNotifications) {
      setNotificationsEventPagination(eventNotifications)
    }
  }, [eventNotifications])

  useEffect(() => {
    if (urgentNotifications) {
      setNotificationsUrgentPagination(urgentNotifications)
    }
  }, [urgentNotifications])
  const [
    deleteNotification,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteNotificationMutation()
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
    deleteNotification({ id: deleteInfo.id })
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
              <title>اعلانات</title>
            </Head>

            <div id="_adminNotifications">
              <div className="">
                <Tab.Group
                  selectedIndex={
                    notificationTabKey === 'allNotifications'
                      ? 0
                      : notificationTabKey === 'eventNotifications'
                      ? 1
                      : notificationTabKey === 'urgentNotifications'
                      ? 2
                      : 0
                  }
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setNotificationTabKey('allNotifications')
                        break
                      case 1:
                        setNotificationTabKey('eventNotifications')
                        break
                      case 2:
                        setNotificationTabKey('urgentNotifications')
                        break
                      default:
                        setNotificationTabKey('allNotifications')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">اعلانات</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(notificationsPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          مناسبتی ({digitsEnToFa(notificationsEventPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          فوری ({digitsEnToFa(notificationsUrgentPagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Button
                          onClick={() => push('/admin/support/messages/notifications/new')}
                          className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                        >
                          اعلان جدید
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
                          isError={isAllNotificationsError}
                          refetch={refetchAllNotifications}
                          isFetching={isAllNotificationsIsFetching}
                          isSuccess={isAllNotificationsSuccess}
                          dataLength={
                            notificationsPagination?.data?.data ? notificationsPagination.data?.data.length : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد اعلان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">زمان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ارسال به
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">سمت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نوع ارسال</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {notificationsPagination?.data?.data &&
                                notificationsPagination?.data?.data.map((notification, index) => {
                                  return (
                                    <tr
                                      key={notification.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-center farsi-digits">
                                        {notification.notificationCode}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">{notification.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        {moment(notification.created).format('jYYYY/jMM/jDD HH:mm')}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">
                                        {' '}
                                        {notification.user.fullName === ' '
                                          ? notification.user.mobileNumber
                                          : notification.user.fullName}
                                      </td>
                                      <td className="text-sm text-center">
                                        {notification.user.userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : notification.user.userSpecification.userType.toString() === '1'
                                          ? `پرسنل - ${notification.user.fullName}`
                                          : notification.user.userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      {/* 
                                      <td className="text-sm text-center">
                                        <div className="text-sm text-sm  px-2">{ticket.nameEn}</div>
                                      </td>

                                      <td className="text-sm text-center">
                                        <div className="">{ticket.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      */}
                                      <td className="text-sm text-center">
                                        {notification.sendingTime == 1 ? (
                                          <div className="">فوری</div>
                                        ) : notification.sendingTime == 2 ? (
                                          <div className="">مناسبتی</div>
                                        ) : (
                                          <div className="">فوری</div>
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
                                                        push(`/admin/support/messages/notification/${notification.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>ویرایش</span>
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(notification.id)
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

                        {notificationsPagination?.data?.data &&
                          notificationsPagination?.data?.data?.length > 0 &&
                          notificationsPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={notificationsPagination?.data}
                                section="_adminNotification"
                                client
                              />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminEventNotification">
                        <DataStateDisplay
                          isError={isEventNotificationsError}
                          refetch={refetchEventNotifications}
                          isFetching={isEventNotificationsFetching}
                          isSuccess={isEventNotificationsSuccess}
                          dataLength={
                            notificationsEventPagination?.data?.data
                              ? notificationsEventPagination.data?.data.length
                              : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد اعلان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">زمان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ارسال به
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">سمت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نوع ارسال</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {notificationsEventPagination?.data?.data &&
                                notificationsEventPagination?.data?.data.map((notification, index) => {
                                  return (
                                    <tr
                                      key={notification.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-center farsi-digits">
                                        {notification.notificationCode}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">{notification.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        {moment(notification.created).format('jYYYY/jMM/jDD HH:mm')}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">
                                        {' '}
                                        {notification.user.fullName === ' '
                                          ? notification.user.mobileNumber
                                          : notification.user.fullName}
                                      </td>
                                      <td className="text-sm text-center">
                                        {notification.user.userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : notification.user.userSpecification.userType.toString() === '1'
                                          ? `پرسنل - ${notification.user.fullName}`
                                          : notification.user.userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      {/* 
                                      <td className="text-sm text-center">
                                        <div className="text-sm text-sm  px-2">{ticket.nameEn}</div>
                                      </td>

                                      <td className="text-sm text-center">
                                        <div className="">{ticket.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      */}
                                      <td className="text-sm text-center">
                                        {notification.sendingTime == 1 ? (
                                          <div className="">فوری</div>
                                        ) : notification.sendingTime == 2 ? (
                                          <div className="">مناسبتی</div>
                                        ) : (
                                          <div className="">فوری</div>
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
                                                        push(`/admin/support/messages/notification/${notification.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>ویرایش</span>
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(notification.id)
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

                        {notificationsEventPagination?.data?.data &&
                          notificationsEventPagination?.data?.data?.length > 0 &&
                          notificationsEventPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={notificationsEventPagination?.data}
                                section="_adminNotification"
                                client
                              />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminUrgentNotification">
                        <DataStateDisplay
                          isError={isUrgentNotificationsError}
                          refetch={refetchUrgentNotifications}
                          isFetching={isUrgentNotificationsFetching}
                          isSuccess={isUrgentNotificationsSuccess}
                          dataLength={
                            notificationsUrgentPagination?.data?.data
                              ? notificationsUrgentPagination.data?.data.length
                              : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد اعلان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">زمان</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ارسال به
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">سمت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">نوع ارسال</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {notificationsUrgentPagination?.data?.data &&
                                notificationsUrgentPagination?.data?.data.map((notification, index) => {
                                  return (
                                    <tr
                                      key={notification.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-center farsi-digits">
                                        {notification.notificationCode}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">{notification.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        {moment(notification.created).format('jYYYY/jMM/jDD HH:mm')}
                                      </td>
                                      <td className="text-sm text-center farsi-digits">
                                        {' '}
                                        {notification.user.fullName === ' '
                                          ? notification.user.mobileNumber
                                          : notification.user.fullName}
                                      </td>
                                      <td className="text-sm text-center">
                                        {notification.user.userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : notification.user.userSpecification.userType.toString() === '1'
                                          ? `پرسنل - ${notification.user.fullName}`
                                          : notification.user.userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      {/* 
                                      <td className="text-sm text-center">
                                        <div className="text-sm text-sm  px-2">{ticket.nameEn}</div>
                                      </td>

                                      <td className="text-sm text-center">
                                        <div className="">{ticket.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      */}
                                      <td className="text-sm text-center">
                                        {notification.sendingTime == 1 ? (
                                          <div className="">فوری</div>
                                        ) : notification.sendingTime == 2 ? (
                                          <div className="">مناسبتی</div>
                                        ) : (
                                          <div className="">فوری</div>
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
                                                        push(`/admin/support/messages/notification/${notification.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>ویرایش</span>
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(notification.id)
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

                        {notificationsUrgentPagination?.data?.data &&
                          notificationsUrgentPagination?.data?.data?.length > 0 &&
                          notificationsUrgentPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={notificationsUrgentPagination?.data}
                                section="_adminNotification"
                                client
                              />
                            </div>
                          )}
                      </div>
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

export default dynamic(() => Promise.resolve(Notification), { ssr: false })
