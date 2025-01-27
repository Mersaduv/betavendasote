import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout, UserTabDashboardLayout } from '@/components/Layouts'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { useRouter } from 'next/router'
import {
  useDeleteRoleMutation,
  useDeleteTrashUserMutation,
  useDeleteUserMutation,
  useGetAllCategoriesQuery,
  useGetRolesQuery,
  useGetUsersQuery,
  useRestoreUserMutation,
} from '@/services'
import { Fragment, useEffect, useState } from 'react'
import { GetRolesResult, GetUsersResult } from '@/services/user/types'
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
import { IRole } from '@/types'
import { showAlert } from '@/store'
const Roles = () => {
  // ? States
  const [searchTerm, setSearchTerm] = useState('')
  const [tabKey, setTabKey] = useState('allUsers')
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  //? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const rolePage = query.page ? +query.page : 1

  const [rolesPagination, setRolesPagination] = useState<GetRolesResult>()
  const [rolesActivePagination, setRolesActivePagination] = useState<GetRolesResult>()
  const [rolesInActivePagination, setRolesInActivePagination] = useState<GetRolesResult>()
  const useFetchRoles = (status: string) => {
    const commonRoleQueryParams = {
      pageSize: 8,
      page: rolePage,
      search: searchTerm,
      isActive: status === 'isActive',
      inActive: status === 'inActive',
      adminList: status === 'adminList',
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetRolesQuery({ ...commonRoleQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allRoles,
    isError: isAllRolesError,
    isFetching: isAllRolesFetching,
    isSuccess: isAllRolesSuccess,
    refetch: refetchAllRoles,
  } = useFetchRoles('adminList')

  const {
    data: activeRoles,
    isError: isActiveRolesError,
    isFetching: isActiveRolesFetching,
    isSuccess: isActiveRolesSuccess,
    refetch: refetchActiveRoles,
  } = useFetchRoles('isActive')

  const {
    data: inactiveRoles,
    isError: isInactiveRolesError,
    isFetching: isInactiveRolesFetching,
    isSuccess: isInactiveRolesSuccess,
    refetch: refetchInactiveRoles,
  } = useFetchRoles('inActive')

  useEffect(() => {
    if (allRoles) {
      setRolesPagination(allRoles)
    }
  }, [allRoles])

  useEffect(() => {
    if (activeRoles) {
      setRolesActivePagination(activeRoles)
    }
  }, [activeRoles])

  useEffect(() => {
    if (inactiveRoles) {
      setRolesInActivePagination(inactiveRoles)
    }
  }, [inactiveRoles])

  const [
    deleteRole,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteRoleMutation()

  //? Handler
  const handleChangePage = (roleQuery: string) => {
    push(`/admin/users/personnel?role=${roleQuery}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  //*   Delete Handlers
  const handleDelete = (role: IRole) => {
    if (role.roleUserCount > 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'سمت مد نظر تخصیص داده شده',
        })
      )
    } else {
      setDeleteInfo({ id: role.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirmDelete = () => {
    deleteRole({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    // handleAllRefetch()
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  return (
    <ProtectedRouteWrapper>
      <>
        {/* Confirm Delete User Modal */}
        <ConfirmDeleteModal
          title="سمت"
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
        <Head>
          <title>سمت ها</title>
        </Head>
        <DashboardLayout>
          <section className="w-full mt-7 flex flex-col">
            <div className="mx-3 bg-white rounded-xl shadow-item">
              <div className="relative overflow-x-auto min-h-96">
                <Tab.Group
                  selectedIndex={
                    tabKey === 'allRoles' ? 0 : tabKey === 'isActiveRole' ? 1 : tabKey === 'inActiveRole' ? 2 : 0
                  }
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setTabKey('allRoles')
                        break
                      case 1:
                        setTabKey('isActiveRole')
                        break
                      case 2:
                        setTabKey('inActiveRole')
                        break
                      default:
                        setTabKey('allRoles')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">سمت ها</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(rolesPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          فعال ({digitsEnToFa(rolesActivePagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          غیرفعال ({digitsEnToFa(rolesInActivePagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Button
                          onClick={() => push('/admin/users/roles/new')}
                          className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                        >
                          افزودن سمت
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
                  </Tab.List>
                  <Tab.Panels className="mt-3 rounded-xl bg-white p-3">
                    <Tab.Panel>
                      <div id="_adminRolesAll">
                        <DataStateDisplay
                          isError={isAllRolesError}
                          refetch={refetchAllRoles}
                          isFetching={isAllRolesFetching}
                          isSuccess={isAllRolesSuccess}
                          dataLength={rolesPagination?.data?.data ? rolesPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  عنوان
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">تخصیص</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rolesPagination?.data?.data &&
                                rolesPagination?.data?.data.map((role, index) => {
                                  return (
                                    <tr
                                      key={role.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-center">
                                        <div className="text-sm px-2">{role.title}</div>
                                      </td>
                                      <td className="text-center">
                                        <div>
                                          {role.isActive ? (
                                            <span className="text-sm text-green-500  px-1.5 rounded">فعال</span>
                                          ) : (
                                            <span className="text-sm text-red-500 px-1.5 rounded ">غیر فعال</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        {role.roleUserCount === 0 ? (
                                          '-'
                                        ) : (
                                          <div
                                            className="text-sky-500 cursor-pointer"
                                            onClick={() => handleChangePage(role.id)}
                                          >
                                            {digitsEnToFa(role.roleUserCount)}
                                          </div>
                                        )}
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
                                                      href={`/admin/users/roles/edit/${role.id}`}
                                                      onClick={close}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>مشاهده</span>
                                                    </Link>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(role)
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

                        {rolesPagination?.data?.data &&
                          rolesPagination?.data?.data?.length > 0 &&
                          rolesPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={rolesPagination?.data} section="_adminUsersAll" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminActiveRoles">
                        <DataStateDisplay
                          isError={isActiveRolesError}
                          refetch={refetchActiveRoles}
                          isFetching={isActiveRolesFetching}
                          isSuccess={isActiveRolesSuccess}
                          dataLength={rolesActivePagination?.data?.data ? rolesActivePagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  عنوان
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">تخصیص</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rolesActivePagination?.data?.data &&
                                rolesActivePagination?.data?.data.map((role, index) => {
                                  return (
                                    <tr
                                      key={role.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-center">
                                        <div className="text-sm px-2">{role.title}</div>
                                      </td>
                                      <td className="text-center">
                                        <div>
                                          {role.isActive ? (
                                            <span className="text-sm text-green-500  px-1.5 rounded">فعال</span>
                                          ) : (
                                            <span className="text-sm text-red-500 px-1.5 rounded ">غیر فعال</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        {role.roleUserCount === 0 ? (
                                          '-'
                                        ) : (
                                          <div
                                            className="text-sky-500 cursor-pointer"
                                            onClick={() => handleChangePage(role.id)}
                                          >
                                            {digitsEnToFa(role.roleUserCount)}
                                          </div>
                                        )}
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
                                                      href={`/admin/users/roles/edit/${role.id}`}
                                                      onClick={close}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>مشاهده</span>
                                                    </Link>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(role)
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

                        {rolesActivePagination?.data?.data &&
                          rolesActivePagination?.data?.data?.length > 0 &&
                          rolesActivePagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={rolesActivePagination?.data} section="_adminUsersAll" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminInActiveRoles">
                        <DataStateDisplay
                          isError={isInactiveRolesError}
                          refetch={refetchInactiveRoles}
                          isFetching={isInactiveRolesFetching}
                          isSuccess={isInactiveRolesSuccess}
                          dataLength={
                            rolesInActivePagination?.data?.data ? rolesInActivePagination.data?.data.length : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  عنوان
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">تخصیص</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rolesInActivePagination?.data?.data &&
                                rolesInActivePagination?.data?.data.map((role, index) => {
                                  return (
                                    <tr
                                      key={role.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="text-center">
                                        <div className="text-sm px-2">{role.title}</div>
                                      </td>
                                      <td className="text-center">
                                        <div>
                                          {role.isActive ? (
                                            <span className="text-sm text-green-500  px-1.5 rounded">فعال</span>
                                          ) : (
                                            <span className="text-sm text-red-500 px-1.5 rounded ">غیر فعال</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        {role.roleUserCount === 0 ? (
                                          '-'
                                        ) : (
                                          <div
                                            className="text-sky-500 cursor-pointer"
                                            onClick={() => handleChangePage(role.id)}
                                          >
                                            {digitsEnToFa(role.roleUserCount)}
                                          </div>
                                        )}
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
                                                      href={`/admin/users/roles/edit/${role.id}`}
                                                      onClick={close}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>مشاهده</span>
                                                    </Link>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(role)
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

                        {rolesInActivePagination?.data?.data &&
                          rolesInActivePagination?.data?.data?.length > 0 &&
                          rolesInActivePagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={rolesInActivePagination?.data} section="_adminUsersAll" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </section>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Roles), { ssr: false })
