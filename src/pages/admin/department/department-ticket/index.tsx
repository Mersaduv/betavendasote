import { DashboardLayout, DepartmentTabDashboardLayout } from '@/components/Layouts'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { useDisclosure } from '@/hooks'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Menu, Transition } from '@headlessui/react'
import { useGetTicketTypesQuery } from '@/services'
import { Fragment } from 'react'
import { useRouter } from 'next/router'
const DepartmentTicket: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  // ? Queries
  const { data: ticketTypeData } = useGetTicketTypesQuery({ pageSize: 99999 })
  // States

  // ? Handlers
  const handleChangeRoute = (userType: number) => {
    push(`/admin/department/department-ticket/list?userType=${userType}`)
  }

  if (ticketTypeData) {
    console.log(ticketTypeData, 'ticketTypeData')
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {' '}
        <DashboardLayout>
          <DepartmentTabDashboardLayout>
            <Head>
              <title>دپارتمان تیکت</title>
            </Head>
            <div className="flex gap-y-4 pt-4 sm:flex-row flex-col items-center w-full">
              <div className="w-full">
                <div className="flex gap-y-4 px-6 sm:flex-row flex-col items-center justify-between">
                  <h3>دپارتمان تیکت</h3>
                </div>
                <hr className="mt-5 mb-6" />
                <table className="w-[700px] md:w-full mx-auto">
                  <thead className="bg-sky-300">
                    <tr className="">
                      <th className="text-sm py-3 px-2 text-gray-600 font-normal ">مرتبط به</th>
                      <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[33%]">مقدار</th>
                      <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[33%]">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={`h-16 border-b bg-gray-50`}>
                      <td className="text-center text-sm text-gray-600">پرسنل</td>
                      <td className="text-center farsi-digits">
                        {ticketTypeData?.data?.data?.filter((item) => item.userTypes === 1).length ?? '-'}
                      </td>
                      <td className="text-center text-sm text-gray-600">
                        <Menu as="div" className={`dropdown`}>
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
                                    <button
                                      onClick={() => {
                                        handleChangeRoute(1)
                                        close()
                                      }}
                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                    >
                                      <span>پیکربندی</span>
                                    </button>
                                  </>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                    </tr>

                    <tr className={`h-16 border-b bg-white`}>
                      <td className="text-center text-sm text-gray-600">مشتری</td>
                      <td className="text-center farsi-digits">
                        {ticketTypeData?.data?.data?.filter((item) => item.userTypes === 0).length ?? '-'}
                      </td>
                      <td className="text-center text-sm text-gray-600">
                        <Menu as="div" className={`dropdown`}>
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
                                    <button
                                      onClick={() => {
                                        handleChangeRoute(0)
                                        close()
                                      }}
                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                    >
                                      <span>پیکربندی</span>
                                    </button>
                                  </>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                    </tr>

                    <tr className={`h-16 border-b bg-gray-50`}>
                      <td className="text-center text-sm text-gray-600">فروشنده</td>
                      <td className="text-center farsi-digits">
                        {ticketTypeData?.data?.data?.filter((item) => item.userTypes === 2).length ?? '-'}
                      </td>
                      <td className="text-center text-sm text-gray-600">
                        <Menu as="div" className={`dropdown`}>
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
                                    <button
                                      onClick={() => {
                                        handleChangeRoute(2)
                                        close()
                                      }}
                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                    >
                                      <span>پیکربندی</span>
                                    </button>
                                  </>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </DepartmentTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}
export default dynamic(() => Promise.resolve(DepartmentTicket), { ssr: false })