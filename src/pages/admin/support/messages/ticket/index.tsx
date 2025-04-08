import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, SupportTabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import { useGetTicketsQuery } from '@/services'
import { useRouter } from 'next/router'
import { ITicket, UserTypes } from '@/types'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { GetTicketsResult } from '@/services/user/types'
import moment from 'moment-jalaali'
const Ticket: NextPage = () => {
  // States
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()
  const [isShowEditTicketModal, editTicketModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateTicket, setStateTicket] = useState<ITicket>()
  const [ticketTabKey, setTicketTabKey] = useState('allTickets')
  const [userType, setUserType] = useState('')
  const [selectUserTypeState, setSelectUserTypeState] = useState<string | undefined>(undefined)
  const { generalSetting } = useAppSelector((state) => state.design)
  // ? Assets
  const { query, push } = useRouter()
  const ticketPage = query.page ? +query.page : 1
  // ? tickets Query
  const [ticketsPagination, setTicketsPagination] = useState<GetTicketsResult>()
  const [ticketsOpenPagination, setTicketsOpenPagination] = useState<GetTicketsResult>()
  const [ticketsInAnsweredPagination, setTicketsInAnsweredPagination] = useState<GetTicketsResult>()
  const [ticketsClosePagination, setTicketsClosePagination] = useState<GetTicketsResult>()
  // const {
  //   data: brandData,
  //   refetch,
  //   ...brandsQueryProps
  // } = useGetBrandsQuery({
  //   pageSize: 20,
  //   page: brandPage,
  //   search: searchTerm,
  // })
  const useFetchTickets = (status: string) => {
    const commonTicketQueryParams = {
      pageSize: 8,
      page: ticketPage,
      search: searchTerm,
      userType: selectUserTypeState,
      openTicket: status === 'open',
      answeredTicket: status === 'answered',
      closeTicket: status === 'close',
      adminList: true,
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetTicketsQuery({ ...commonTicketQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allTickets,
    isError: isAllTicketsError,
    isFetching: isAllTicketsFetching,
    isSuccess: isAllTicketsSuccess,
    refetch: refetchAllTickets,
  } = useFetchTickets('')

  const {
    data: openTickets,
    isError: isOpenTicketsError,
    isFetching: isOpenTicketsFetching,
    isSuccess: isOpenTicketsSuccess,
    refetch: refetchOpenTickets,
  } = useFetchTickets('open')

  const {
    data: answeredTickets,
    isError: isAnsweredTicketsError,
    isFetching: isAnsweredTicketsFetching,
    isSuccess: isAnsweredTicketsSuccess,
    refetch: refetchAnsweredTickets,
  } = useFetchTickets('answered')

  const {
    data: closeTickets,
    isError: isCloseTicketsError,
    isFetching: isCloseTicketsFetching,
    isSuccess: isCloseTicketsSuccess,
    refetch: refetchCloseTickets,
  } = useFetchTickets('close')

  useEffect(() => {
    if (allTickets) {
      setTicketsPagination(allTickets)
    }
  }, [allTickets])

  useEffect(() => {
    if (openTickets) {
      setTicketsOpenPagination(openTickets)
    }
  }, [openTickets])

  useEffect(() => {
    if (answeredTickets) {
      setTicketsInAnsweredPagination(answeredTickets)
    }
  }, [answeredTickets])

  useEffect(() => {
    if (closeTickets) {
      setTicketsClosePagination(closeTickets)
    }
  }, [closeTickets])

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
          <SupportTabDashboardLayout>
            <Head>
              <title>تیکت ها</title>
            </Head>

            <div id="_adminTickets">
              <div className="">
                <Tab.Group
                  selectedIndex={
                    ticketTabKey === 'allTickets'
                      ? 0
                      : ticketTabKey === 'openTickets'
                      ? 1
                      : ticketTabKey === 'answeredTickets'
                      ? 2
                      : ticketTabKey === 'closeTickets'
                      ? 3
                      : 0
                  }
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setTicketTabKey('allTickets')
                        break
                      case 1:
                        setTicketTabKey('openTickets')
                        break
                      case 2:
                        setTicketTabKey('answeredTickets')
                        break
                      case 3:
                        setTicketTabKey('closeTickets')
                        break
                      default:
                        setTicketTabKey('allTickets')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">تیکت</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(ticketsPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          باز ({digitsEnToFa(ticketsOpenPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          پاسخ داده شده ({digitsEnToFa(ticketsInAnsweredPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          بسته ({digitsEnToFa(ticketsClosePagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Button
                          onClick={() => push('/admin/support/messages/ticket/new')}
                          className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                        >
                          تیکت جدید
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
                            <option value="1">{generalSetting?.title}</option>
                            <option value="0">مشتری</option>
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
                      <div id="_adminTicketsAll">
                        <DataStateDisplay
                          isError={isAllTicketsError}
                          refetch={refetchAllTickets}
                          isFetching={isAllTicketsFetching}
                          isSuccess={isAllTicketsSuccess}
                          dataLength={ticketsPagination?.data?.data ? ticketsPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 pr-6 text-gray-600 font-normal text-start w-[15%]">
                                  کد تیکت
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-start w-[15%]">
                                  فرستنده
                                </th>
                                <th className="text-sm py-3 text-gray-600 font-normal text-start ">گیرنده</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-start w-[15%]">
                                  عنوان
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center w-[15%]">
                                  زمان ارسال
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center ">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center ">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticketsPagination?.data?.data &&
                                ticketsPagination?.data?.data.map((ticket, index) => {
                                  console.log(ticket, 'ticket')

                                  return (
                                    <tr
                                      key={ticket.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-start px-2 farsi-digits">{ticket.ticketCode}</td>
                                      <td className="text-sm text-start farsi-digits relative group">
                                        <div>{generalSetting?.title}</div>
                                        <div className="absolute hidden group-hover:flex flex-col bg-white border border-gray-300 shadow-lg p-2 rounded-md z-10">
                                          <div className="text-center mb-1">
                                            {ticket.ticketMessages[0].user.fullName}
                                          </div>
                                          <div className="text-center">
                                            {ticket.ticketMessages[0].user.mobileNumber}
                                          </div>
                                          <div className="text-center">
                                            {ticket.ticketMessages[0].user.userSpecification.role.title}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-sm text-start">
                                        {ticket.user.userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : ticket.user.userSpecification.userType.toString() === '1'
                                          ? `پرسنل`
                                          : ticket.user.userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      <td className="text-sm text-start">{ticket.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        <div>{moment(ticket.created).format('jYYYY/jMM/jDD')}</div>
                                        <div>{moment(ticket.created).format('HH:mm')}</div>
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
                                        {ticket.status == 1 ? (
                                          <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            باز
                                          </div>
                                        ) : ticket.status == 3 ? (
                                          <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            بسته
                                          </div>
                                        ) : (
                                          <div className="text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            پاسخ داده شده
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
                                                        push(`/admin/support/messages/ticket/${ticket.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>مشاهده</span>
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

                        {ticketsPagination?.data?.data &&
                          ticketsPagination?.data?.data?.length > 0 &&
                          ticketsPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={ticketsPagination?.data} section="_adminBrands" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminOpenTickets">
                        <DataStateDisplay
                          isError={isOpenTicketsError}
                          refetch={refetchOpenTickets}
                          isFetching={isOpenTicketsFetching}
                          isSuccess={isOpenTicketsSuccess}
                          dataLength={ticketsOpenPagination?.data?.data ? ticketsOpenPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد تیکت</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ایجاد کننده
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">تاریخ ایجاد</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">گیرنده</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticketsOpenPagination?.data?.data &&
                                ticketsOpenPagination?.data?.data.map((ticket, index) => {
                                  return (
                                    <tr
                                    key={ticket.id}
                                    className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                  >
                                    <td className="text-sm text-start px-2 farsi-digits">{ticket.ticketCode}</td>
                                    <td className="text-sm text-start farsi-digits relative group">
                                      <div>{generalSetting?.title}</div>
                                      <div className="absolute hidden group-hover:flex flex-col bg-white border border-gray-300 shadow-lg p-2 rounded-md z-10">
                                        <div className="text-center mb-1">
                                          {ticket.ticketMessages[0].user.fullName}
                                        </div>
                                        <div className="text-center">
                                          {ticket.ticketMessages[0].user.mobileNumber}
                                        </div>
                                        <div className="text-center">
                                          {ticket.ticketMessages[0].user.userSpecification.role.title}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-sm text-start">
                                      {ticket.user.userSpecification.userType.toString() === '0'
                                        ? 'مشتری'
                                        : ticket.user.userSpecification.userType.toString() === '1'
                                        ? `پرسنل`
                                        : ticket.user.userSpecification.userType.toString() === '2'
                                        ? 'مشتری'
                                        : '-'}{' '}
                                    </td>
                                    <td className="text-sm text-start">{ticket.subject}</td>
                                    <td className="text-sm text-center farsi-digits">
                                      <div>{moment(ticket.created).format('jYYYY/jMM/jDD')}</div>
                                      <div>{moment(ticket.created).format('HH:mm')}</div>
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
                                      {ticket.status == 1 ? (
                                        <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          باز
                                        </div>
                                      ) : ticket.status == 3 ? (
                                        <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          بسته
                                        </div>
                                      ) : (
                                        <div className="text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          پاسخ داده شده
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
                                                      push(`/admin/support/messages/ticket/${ticket.id}`)
                                                      close()
                                                    }}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>مشاهده</span>
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

                        {ticketsOpenPagination?.data?.data &&
                          ticketsOpenPagination?.data?.data?.length > 0 &&
                          ticketsOpenPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={ticketsOpenPagination?.data} section="_adminBrands" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminAnsweredTickets">
                        <DataStateDisplay
                          isError={isAnsweredTicketsError}
                          refetch={refetchAnsweredTickets}
                          isFetching={isAnsweredTicketsFetching}
                          isSuccess={isAnsweredTicketsSuccess}
                          dataLength={
                            ticketsInAnsweredPagination?.data?.data ? ticketsInAnsweredPagination.data?.data.length : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد تیکت</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ایجاد کننده
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">تاریخ ایجاد</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">گیرنده</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticketsInAnsweredPagination?.data?.data &&
                                ticketsInAnsweredPagination?.data?.data.map((ticket, index) => {
                                  return (
                                    <tr
                                      key={ticket.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-sm text-start px-2 farsi-digits">{ticket.ticketCode}</td>
                                      <td className="text-sm text-start farsi-digits relative group">
                                        <div>{generalSetting?.title}</div>
                                        <div className="absolute hidden group-hover:flex flex-col bg-white border border-gray-300 shadow-lg p-2 rounded-md z-10">
                                          <div className="text-center mb-1">
                                            {ticket.ticketMessages[0].user.fullName}
                                          </div>
                                          <div className="text-center">
                                            {ticket.ticketMessages[0].user.mobileNumber}
                                          </div>
                                          <div className="text-center">
                                            {ticket.ticketMessages[0].user.userSpecification.role.title}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-sm text-start">
                                        {ticket.user.userSpecification.userType.toString() === '0'
                                          ? 'مشتری'
                                          : ticket.user.userSpecification.userType.toString() === '1'
                                          ? `پرسنل`
                                          : ticket.user.userSpecification.userType.toString() === '2'
                                          ? 'مشتری'
                                          : '-'}{' '}
                                      </td>
                                      <td className="text-sm text-start">{ticket.subject}</td>
                                      <td className="text-sm text-center farsi-digits">
                                        <div>{moment(ticket.created).format('jYYYY/jMM/jDD')}</div>
                                        <div>{moment(ticket.created).format('HH:mm')}</div>
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
                                        {ticket.status == 1 ? (
                                          <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            باز
                                          </div>
                                        ) : ticket.status == 3 ? (
                                          <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            بسته
                                          </div>
                                        ) : (
                                          <div className="text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                            پاسخ داده شده
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
                                                        push(`/admin/support/messages/ticket/${ticket.id}`)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>مشاهده</span>
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

                        {ticketsInAnsweredPagination?.data?.data &&
                          ticketsInAnsweredPagination?.data?.data?.length > 0 &&
                          ticketsInAnsweredPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={ticketsInAnsweredPagination?.data}
                                section="_adminBrands"
                                client
                              />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminCloseTickets">
                        <DataStateDisplay
                          isError={isCloseTicketsError}
                          refetch={refetchCloseTickets}
                          isFetching={isCloseTicketsFetching}
                          isSuccess={isCloseTicketsSuccess}
                          dataLength={ticketsClosePagination?.data?.data ? ticketsClosePagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">کد تیکت</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">
                                  ایجاد کننده
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal text-center">عنوان</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">تاریخ ایجاد</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">گیرنده</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal text-center">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticketsClosePagination?.data?.data &&
                                ticketsClosePagination?.data?.data.map((ticket, index) => {
                                  return (
                                    <tr
                                    key={ticket.id}
                                    className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                  >
                                    <td className="text-sm text-start px-2 farsi-digits">{ticket.ticketCode}</td>
                                    <td className="text-sm text-start farsi-digits relative group">
                                      <div>{generalSetting?.title}</div>
                                      <div className="absolute hidden group-hover:flex flex-col bg-white border border-gray-300 shadow-lg p-2 rounded-md z-10">
                                        <div className="text-center mb-1">
                                          {ticket.ticketMessages[0].user.fullName}
                                        </div>
                                        <div className="text-center">
                                          {ticket.ticketMessages[0].user.mobileNumber}
                                        </div>
                                        <div className="text-center">
                                          {ticket.ticketMessages[0].user.userSpecification.role.title}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-sm text-start">
                                      {ticket.user.userSpecification.userType.toString() === '0'
                                        ? 'مشتری'
                                        : ticket.user.userSpecification.userType.toString() === '1'
                                        ? `پرسنل`
                                        : ticket.user.userSpecification.userType.toString() === '2'
                                        ? 'مشتری'
                                        : '-'}{' '}
                                    </td>
                                    <td className="text-sm text-start">{ticket.subject}</td>
                                    <td className="text-sm text-center farsi-digits">
                                      <div>{moment(ticket.created).format('jYYYY/jMM/jDD')}</div>
                                      <div>{moment(ticket.created).format('HH:mm')}</div>
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
                                      {ticket.status == 1 ? (
                                        <div className="text-green-500 bg-[#e8fff3] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          باز
                                        </div>
                                      ) : ticket.status == 3 ? (
                                        <div className="text-[#f1416c] bg-[#fff5f8] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          بسته
                                        </div>
                                      ) : (
                                        <div className="text-[#ffc700] bg-[#fff8dd] w-fit flex mx-auto px-2 rounded-md text-sm font-medium">
                                          پاسخ داده شده
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
                                                      push(`/admin/support/messages/ticket/${ticket.id}`)
                                                      close()
                                                    }}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>مشاهده</span>
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

                        {ticketsClosePagination?.data?.data &&
                          ticketsClosePagination?.data?.data?.length > 0 &&
                          ticketsClosePagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={ticketsClosePagination?.data} section="_adminBrands" client />
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

export default dynamic(() => Promise.resolve(Ticket), { ssr: false })
