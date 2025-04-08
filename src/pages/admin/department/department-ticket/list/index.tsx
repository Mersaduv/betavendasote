import { EmptyCustomList } from '@/components/emptyList'
import { DashboardLayout, DepartmentTabDashboardLayout } from '@/components/Layouts'
import { ConfirmDeleteModal, TicketTypeModal } from '@/components/modals'
import { HandleResponse } from '@/components/shared'
import { Button } from '@/components/ui'
import { ProtectedRouteWrapper } from '@/components/user'
import { useDisclosure } from '@/hooks'
import { useDeleteTicketTypeMutation, useGetTicketTypesQuery } from '@/services'
import { ITicketType } from '@/types/models/ITicketType.type'
import { Menu, Transition } from '@headlessui/react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

const DepartmentTicketList: NextPage = () => {
  // ? Assets
  const { query, push } = useRouter()
  const userType = Number(query?.userType)
  // States
  const [stateTicketType, setStateTicketType] = useState<ITicketType>()
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [isShowTicketTypeModal, ticketTypeModalHandlers] = useDisclosure()
  const [isShowEditTicketTypeModal, ticketEditTypeModalHandlers] = useDisclosure()
  // ? Queries
  const { data: ticketTypeData, refetch } = useGetTicketTypesQuery({ pageSize: 99999 })
  const [
    deleteTicketType,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteTicketTypeMutation()
  // ? Handler
  const handleEditTicketType = (ticketType: ITicketType) => {
    setStateTicketType(ticketType)
    ticketEditTypeModalHandlers.open()
  }
  const onConfirmDelete = () => {
    deleteTicketType({ id: deleteInfo.id })
  }

  const handleDelete = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }
  const onSuccess = () => {
    refetch()
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  console.log(userType, 'userType', ticketTypeData)
  const departmentTicketTypes = ticketTypeData?.data?.data?.filter((item) => item.userTypes === userType)
  return (
    <ProtectedRouteWrapper>
      <>
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
        <ConfirmDeleteModal
          title="مرجوعی"
          deleted
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmDelete}
        />
        <TicketTypeModal
          title={`افزودن ${userType == 0 ? 'مشتری' : userType == 1 ? 'پرسنل' : 'مشتری'}`}
          mode="create"
          userType={userType}
          refetch={refetch}
          isShow={isShowTicketTypeModal}
          onClose={() => {
            ticketTypeModalHandlers.close()
          }}
        />{' '}
        <TicketTypeModal
          title={`ویرایش ${userType == 0 ? 'مشتری' : userType == 1 ? 'پرسنل' : 'مشتری'}`}
          mode="edit"
          userType={userType}
          ticketTypeData={stateTicketType}
          refetch={refetch}
          isShow={isShowEditTicketTypeModal}
          onClose={() => {
            ticketEditTypeModalHandlers.close()
          }}
        />
        <DashboardLayout>
          <DepartmentTabDashboardLayout>
            <Head>
              <title>دپارتمان تیکت</title>
            </Head>
            <div className="flex gap-y-4 pt-4 sm:flex-row flex-col items-center w-full">
              <div className="w-full">
                <div className="flex gap-y-4 px-6 sm:flex-row flex-col items-center justify-between">
                  <h3>پیکره بندی دپارتمان {userType == 0 ? 'مشتری' : userType == 1 ? 'پرسنل' : 'مشتری'}</h3>
                  <div className="flex flex-col xs:flex-row items-center gap-4">
                    <Button
                      onClick={ticketTypeModalHandlers.open}
                      className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                    >
                      افزودن دپارتمان
                    </Button>
                    {/* search filter */}
                    {/* <div className="flex border w-fit rounded-lg">
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
                    </div> */}
                  </div>
                </div>
                <hr className="mt-5 mb-6" />
                <div className="p-3">
                  {departmentTicketTypes && departmentTicketTypes?.length > 0 ? (
                    <table className="w-[700px] md:w-full mx-auto">
                      <thead className="bg-sky-300">
                        <tr className="">
                          <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[25%]">عنوان</th>
                          <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[25%]">توضیحات</th>
                          <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[25%]">وضعیت</th>
                          <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[25%]">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departmentTicketTypes?.map((item) => {
                          return (
                            <tr key={item.id} className={`h-16 border-b bg-gray-50`}>
                              <td className="text-center text-sm text-gray-600">{item.name}</td>
                              <td className="text-center farsi-digits">{item.description ? '✓' : '-'}</td>
                              <td className="text-center text-sm text-gray-600">
                                {item.isActive ? (
                                  <span className="text-sm text-green-500">فعال</span>
                                ) : (
                                  <span className="text-sm text-red-500">غیر فعال</span>
                                )}
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
                                                handleEditTicketType(item)
                                                close()
                                              }}
                                              className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                            >
                                              <span>ویرایش</span>
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDelete(item.id)
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
                  ) : (
                    <EmptyCustomList />
                  )}
                </div>
              </div>
            </div>
          </DepartmentTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}
export default dynamic(() => Promise.resolve(DepartmentTicketList), { ssr: false })
