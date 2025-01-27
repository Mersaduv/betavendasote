import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout, UserTabDashboardLayout } from '@/components/Layouts'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { useRouter } from 'next/router'
import {
  useDeleteTrashUserMutation,
  useDeleteUserMutation,
  useGetAllCategoriesQuery,
  useGetUsersQuery,
  useRestoreUserMutation,
} from '@/services'
import { Fragment, useEffect, useState } from 'react'
import { GetUsersResult } from '@/services/user/types'
import { Menu, Tab, Transition } from '@headlessui/react'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Button } from '@/components/ui'
import { LuSearch } from 'react-icons/lu'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import Link from 'next/link'
import { Pagination } from '@/components/navigation'
import { ConfirmDeleteModal, ConfirmUpdateModal } from '@/components/modals'
import { ProtectedRouteWrapper } from '@/components/user'
const Personnel = () => {
  // ? States
  const [searchTerm, setSearchTerm] = useState('')
  const [tabKey, setTabKey] = useState('allUsers')
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [deleteTrashInfo, setDeleteTrashInfo] = useState({
    id: '',
  })
  const [restoreInfo, setRestoreInfo] = useState({
    id: '',
  })
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [isShowConfirmUpdateModal, confirmUpdateModalHandlers] = useDisclosure()

  const [isShowConfirmTrashDeleteModal, confirmTrashDeleteModalHandlers] = useDisclosure()
  //? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const userPage = query.page ? +query.page : 1
  const role = (query.role as string) ?? ''

  const [usersPagination, setUsersPagination] = useState<GetUsersResult>()
  const [usersActivePagination, setUsersActivePagination] = useState<GetUsersResult>()
  const [usersInActivePagination, setUsersInActivePagination] = useState<GetUsersResult>()
  const [usersIsDeletedPagination, setUsersIsDeletedPagination] = useState<GetUsersResult>()
  const useFetchUsers = (status: string) => {
    const commonUserQueryParams = {
      pageSize: 8,
      page: userPage,
      search: searchTerm,
      userType: 1,
      role: role || undefined,
      isActive: status === 'isActive',
      inActive: status === 'inActive',
      isDeleted: status === 'isDeleted',
      adminList: status === 'adminList',
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetUsersQuery({ ...commonUserQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allUsers,
    isError: isAllUsersError,
    isFetching: isAllUsersFetching,
    isSuccess: isAllUsersSuccess,
    refetch: refetchAllUsers,
  } = useFetchUsers('adminList')

  const {
    data: activeUsers,
    isError: isActiveUsersError,
    isFetching: isActiveUsersFetching,
    isSuccess: isActiveUsersSuccess,
    refetch: refetchActiveUsers,
  } = useFetchUsers('isActive')

  const {
    data: inactiveUsers,
    isError: isInactiveUsersError,
    isFetching: isInactiveUsersFetching,
    isSuccess: isInactiveUsersSuccess,
    refetch: refetchInactiveUsers,
  } = useFetchUsers('inActive')

  const {
    data: deletedUsers,
    isError: isDeletedUsersError,
    isFetching: isDeletedUsersFetching,
    isSuccess: isDeletedUsersSuccess,
    refetch: refetchDeletedUsers,
  } = useFetchUsers('isDeleted')

  useEffect(() => {
    if (allUsers) {
      setUsersPagination(allUsers)
    }
  }, [allUsers])

  useEffect(() => {
    if (activeUsers) {
      setUsersActivePagination(activeUsers)
    }
  }, [activeUsers])

  useEffect(() => {
    if (inactiveUsers) {
      setUsersInActivePagination(inactiveUsers)
    }
  }, [inactiveUsers])

  useEffect(() => {
    if (deletedUsers) {
      setUsersIsDeletedPagination(deletedUsers)
    }
  }, [deletedUsers])

  const [
    deleteUser,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteUserMutation()
  const [
    deleteTrashUser,
    {
      isSuccess: isSuccessTrashDelete,
      isError: isErrorTrashDelete,
      error: errorTrashDelete,
      data: dataTrashDelete,
      isLoading: isLoadingTrashDelete,
    },
  ] = useDeleteTrashUserMutation()

  const [
    restoreUser,
    {
      isSuccess: isSuccessRestore,
      isError: isErrorRestore,
      error: errorRestore,
      data: dataRestore,
      isLoading: isLoadingRestore,
    },
  ] = useRestoreUserMutation()

  //? Handler
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  //*  Restore Handlers
  const handleRestoreTrash = (id: string) => {
    setRestoreInfo({ id })
    confirmUpdateModalHandlers.open()
  }
  const onConfirmRestore = () => {
    restoreUser({ id: restoreInfo.id })
  }

  //*   Delete Handlers
  const handleDeleteTrash = (id: string) => {
    setDeleteTrashInfo({ id })
    confirmTrashDeleteModalHandlers.open()
  }
  const handleDelete = (id: string) => {
    setDeleteInfo({ id })
    confirmDeleteModalHandlers.open()
  }

  const onCancel = () => {
    setDeleteTrashInfo({ id: '' })
    setDeleteInfo({ id: '' })
    setRestoreInfo({ id: '' })
    confirmDeleteModalHandlers.close()
    confirmTrashDeleteModalHandlers.close()
    confirmUpdateModalHandlers.close()
  }

  const onConfirmTrashDelete = () => {
    deleteTrashUser({ id: deleteTrashInfo.id })
  }
  const onConfirmDelete = () => {
    deleteUser({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    // handleAllRefetch()
    confirmUpdateModalHandlers.close()
    confirmDeleteModalHandlers.close()
    confirmTrashDeleteModalHandlers.close()
    setRestoreInfo({ id: '' })
    setDeleteTrashInfo({ id: '' })
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    confirmTrashDeleteModalHandlers.close()
    confirmUpdateModalHandlers.close()
    setRestoreInfo({ id: '' })
    setDeleteTrashInfo({ id: '' })
    setDeleteInfo({ id: '' })
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {/* Confirm Delete User Modal */}
        <ConfirmDeleteModal
          title="کاربر"
          deleted
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmDelete}
        />

        {/* Handle Delete Product Response */}
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
        {/* Confirm Delete Trash User Modal */}
        <ConfirmDeleteModal
          title="کاربر در زباله‌دان"
          isLoading={isLoadingTrashDelete}
          isShow={isShowConfirmTrashDeleteModal}
          onClose={confirmTrashDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirmTrashDelete}
        />

        <ConfirmUpdateModal
          title="کاربر"
          isLoading={isLoadingRestore}
          isShow={isShowConfirmUpdateModal}
          onClose={confirmUpdateModalHandlers.close}
          onConfirm={onConfirmRestore}
          onCancel={onCancel}
        />

        {(isSuccessRestore || isErrorRestore) && (
          <HandleResponse
            isError={isErrorRestore}
            isSuccess={isSuccessRestore}
            error={errorRestore}
            message={dataRestore?.message}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}

        {/* Handle Delete Trash User Response */}
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
        <DashboardLayout>
          <UserTabDashboardLayout>
            <Head>
              <title>لیست کارمندان</title>
            </Head>
            <div className="">
              <Tab.Group
                selectedIndex={
                  tabKey === 'allUsers'
                    ? 0
                    : tabKey === 'isActiveUser'
                    ? 1
                    : tabKey === 'inActiveUser'
                    ? 2
                    : tabKey === 'isDeletedUser'
                    ? 3
                    : 0
                }
                onChange={(index) => {
                  switch (index) {
                    case 0:
                      setTabKey('allUsers')
                      break
                    case 1:
                      setTabKey('isActiveUser')
                      break
                    case 2:
                      setTabKey('inActiveUser')
                      break
                    case 3:
                      setTabKey('isDeletedUser')
                      break
                    default:
                      setTabKey('allUsers')
                  }
                }}
              >
                <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                  <div className="flex flex-col items-start justify-center">
                    <h2 className="pr-4 pb-2">پرسنل</h2>
                    <div className="flex items-center">
                      <Tab
                        className={({ selected }) =>
                          `whitespace-nowrap ${
                            selected ? 'text-sky-500' : 'hover:text-sky-500'
                          } px-4 py-2 rounded cursor-pointer text-sm`
                        }
                      >
                        همه ({digitsEnToFa(usersPagination?.data?.totalCount ?? 0)})
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          `whitespace-nowrap ${
                            selected ? 'text-sky-500' : 'hover:text-sky-500'
                          } px-4 py-2 rounded cursor-pointer text-sm`
                        }
                      >
                        فعال ({digitsEnToFa(usersActivePagination?.data?.totalCount ?? 0)})
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          `whitespace-nowrap ${
                            selected ? 'text-sky-500' : 'hover:text-sky-500'
                          } px-4 py-2 rounded cursor-pointer text-sm`
                        }
                      >
                        غیرفعال ({digitsEnToFa(usersInActivePagination?.data?.totalCount ?? 0)})
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          selected
                            ? 'px-4 py-2 text-sky-500 rounded cursor-pointer text-sm'
                            : 'px-4 py-2 hover:text-sky-500 rounded cursor-pointer text-sm'
                        }
                      >
                        زباله دان ({digitsEnToFa(usersIsDeletedPagination?.data?.totalCount ?? 0)})
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
                    <div id="_adminUsersAll">
                      <DataStateDisplay
                        isError={isAllUsersError}
                        refetch={refetchAllUsers}
                        isFetching={isAllUsersFetching}
                        isSuccess={isAllUsersSuccess}
                        dataLength={usersPagination?.data?.data ? usersPagination.data?.data.length : 0}
                        loadingComponent={<TableSkeleton count={20} />}
                      >
                        <table className="w-[700px] md:w-full mx-auto">
                          <thead className="bg-sky-300">
                            <tr>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">عکس</th>
                              <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                <div className="">شماره کاربری </div>
                              </th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">نام</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">سمت</th>

                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersPagination?.data?.data &&
                              usersPagination?.data?.data.map((user, index) => {
                                return (
                                  <tr key={user.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                    <td className="">
                                      <div className="w-full flex justify-center">
                                        <img
                                          className="w-[100px] object-contain rounded-lg h-[100px]"
                                          src={user.imageSrc?.imageUrl}
                                          alt={user.fullName}
                                        />
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.mobileNumber}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.fullName}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="">
                                        {user.userSpecification.role !== null ? user.userSpecification.role.title : '-'}
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div>
                                        {user.isActive ? (
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
                                                    href={`/admin/users/edit/${user.id}`}
                                                    onClick={close}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>مشاهده</span>
                                                  </Link>
                                                  <button
                                                    onClick={() => {
                                                      handleDeleteTrash(user.id)
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

                      {usersPagination?.data?.data &&
                        usersPagination?.data?.data?.length > 0 &&
                        usersPagination.data?.data && (
                          <div className="mx-auto py-4 lg:max-w-5xl">
                            <Pagination pagination={usersPagination?.data} section="_adminUsersAll" client />
                          </div>
                        )}
                    </div>
                  </Tab.Panel>

                  <Tab.Panel>
                    <div id="_adminActiveUsers">
                      {' '}
                      <DataStateDisplay
                        isError={isAllUsersError}
                        refetch={refetchAllUsers}
                        isFetching={isAllUsersFetching}
                        isSuccess={isAllUsersSuccess}
                        dataLength={usersActivePagination?.data?.data ? usersActivePagination.data?.data.length : 0}
                        loadingComponent={<TableSkeleton count={20} />}
                      >
                        <table className="w-[700px] md:w-full mx-auto">
                          <thead className="bg-sky-300">
                            <tr>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">عکس</th>
                              <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                <div className="">شماره کاربری </div>
                              </th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">نام</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">سمت</th>

                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersActivePagination?.data?.data &&
                              usersActivePagination?.data?.data.map((user, index) => {
                                return (
                                  <tr key={user.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                    <td className="">
                                      <div className="w-full flex justify-center">
                                        <img
                                          className="w-[100px] object-contain rounded-lg h-[100px]"
                                          src={user.imageSrc?.imageUrl}
                                          alt={user.fullName}
                                        />
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.mobileNumber}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.fullName}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="">
                                        {user.userSpecification.role !== null ? user.userSpecification.role.title : '-'}
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div>
                                        {user.isActive ? (
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
                                                    href={`/admin/users/edit/${user.id}`}
                                                    onClick={close}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>مشاهده</span>
                                                  </Link>
                                                  <button
                                                    onClick={() => {
                                                      handleDeleteTrash(user.id)
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
                      {usersActivePagination?.data?.data &&
                        usersActivePagination?.data?.data?.length > 0 &&
                        usersActivePagination.data?.data && (
                          <div className="mx-auto py-4 lg:max-w-5xl">
                            <Pagination pagination={usersActivePagination?.data} section="_adminActiveUsers" client />
                          </div>
                        )}
                    </div>
                  </Tab.Panel>

                  <Tab.Panel>
                    <div id="_adminInActiveUsers">
                      <DataStateDisplay
                        isError={isAllUsersError}
                        refetch={refetchAllUsers}
                        isFetching={isAllUsersFetching}
                        isSuccess={isAllUsersSuccess}
                        dataLength={usersInActivePagination?.data?.data ? usersInActivePagination.data?.data.length : 0}
                        loadingComponent={<TableSkeleton count={20} />}
                      >
                        <table className="w-[700px] md:w-full mx-auto">
                          <thead className="bg-sky-300">
                            <tr>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">عکس</th>
                              <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                <div className="">شماره کاربری </div>
                              </th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">نام</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">سمت</th>

                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersInActivePagination?.data?.data &&
                              usersInActivePagination?.data?.data.map((user, index) => {
                                return (
                                  <tr key={user.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                    <td className="">
                                      <div className="w-full flex justify-center">
                                        <img
                                          className="w-[100px] object-contain rounded-lg h-[100px]"
                                          src={user.imageSrc?.imageUrl}
                                          alt={user.fullName}
                                        />
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.mobileNumber}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.fullName}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="">
                                        {user.userSpecification.role !== null ? user.userSpecification.role.title : '-'}
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div>
                                        {user.isActive ? (
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
                                                    href={`/admin/users/edit/${user.id}`}
                                                    onClick={close}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>مشاهده</span>
                                                  </Link>
                                                  <button
                                                    onClick={() => {
                                                      handleDeleteTrash(user.id)
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
                      {usersInActivePagination?.data?.data &&
                        usersInActivePagination?.data?.data?.length > 0 &&
                        usersInActivePagination.data?.data && (
                          <div className="mx-auto py-4 lg:max-w-5xl">
                            <Pagination
                              pagination={usersInActivePagination?.data}
                              section="_adminInActiveUsers"
                              client
                            />
                          </div>
                        )}
                    </div>
                  </Tab.Panel>

                  <Tab.Panel>
                    <div id="_adminIsDeletedUsers">
                      <DataStateDisplay
                        isError={isAllUsersError}
                        refetch={refetchAllUsers}
                        isFetching={isAllUsersFetching}
                        isSuccess={isAllUsersSuccess}
                        dataLength={
                          usersIsDeletedPagination?.data?.data ? usersIsDeletedPagination.data?.data.length : 0
                        }
                        loadingComponent={<TableSkeleton count={20} />}
                      >
                        <table className="w-[700px] md:w-full mx-auto">
                          <thead className="bg-sky-300">
                            <tr>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">عکس</th>
                              <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                <div className="">شماره کاربری </div>
                              </th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">نام</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">سمت</th>

                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                              <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersIsDeletedPagination?.data?.data &&
                              usersIsDeletedPagination?.data?.data.map((user, index) => {
                                return (
                                  <tr key={user.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                    <td className="">
                                      <div className="w-full flex justify-center">
                                        <img
                                          className="w-[100px] object-contain rounded-lg h-[100px]"
                                          src={user.imageSrc?.imageUrl}
                                          alt={user.fullName}
                                        />
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.mobileNumber}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="text-sm px-2">{user.fullName}</div>
                                    </td>

                                    <td className="text-center">
                                      <div className="">
                                        {user.userSpecification.role !== null ? user.userSpecification.role.title : '-'}
                                      </div>
                                    </td>

                                    <td className="text-center">
                                      <div>
                                        {user.isActive ? (
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
                                                      handleRestoreTrash(user.id)
                                                      close()
                                                    }}
                                                    className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                  >
                                                    <span>بازگردانی</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      handleDelete(user.id)
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
                      {usersIsDeletedPagination?.data?.data &&
                        usersIsDeletedPagination?.data?.data?.length > 0 &&
                        usersIsDeletedPagination.data?.data && (
                          <div className="mx-auto py-4 lg:max-w-5xl">
                            <Pagination
                              pagination={usersIsDeletedPagination?.data}
                              section="_adminIsDeletedUsers"
                              client
                            />
                          </div>
                        )}
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </UserTabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Personnel), { ssr: false })
