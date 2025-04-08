import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import type { NextPage } from 'next'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Tab, Transition } from '@headlessui/react'
import {
  useDeleteCategoryMutation,
  useDeleteFeatureMutation,
  useDeleteFeatureValueMutation,
  useDeleteSizeMutation,
  useGetAllCategoriesQuery,
  useGetFeatureQuery,
  useGetFeaturesQuery,
  useGetFeatureValuesQuery,
  useGetParenSubCategoriesQuery,
  useGetSizesQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { ICategory } from '@/types'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import {
  CategoryModal,
  CategoryUpdateModal,
  ConfirmDeleteModal,
  FeatureModal,
  FeatureValueModal,
  SizeModal,
  SizesModal,
} from '@/components/modals'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { useDispatch } from 'react-redux'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ParentSubCategoriesTree } from '@/components/categories'
import { FeatureValue, ProductFeature, SizeDTO } from '@/services/feature/types'
import { showAlert } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

const Sizes: NextPage = () => {
  // States
  const [isShowSizesModal, sizeModalHandlers] = useDisclosure()
  const [isShowEditSizeModal, editSizeModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateSize, setStateSize] = useState<SizeDTO>()
  // ? Assets
  const { query, push } = useRouter()
  const sizePage = query.page ? +query.page : 1

  const dispatch = useAppDispatch()
  // ? Features Query
  const {
    data: sizeDb,
    refetch,
    ...sizesQueryProps
  } = useGetSizesQuery({
    pageSize: 8,
    page: sizePage,
    search: searchTerm,
  })

  //*    Delete Size
  const [
    deleteSize,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteSizeMutation()

  const handleChangePage = (id: string) => {
    push(`/admin/products?sizes=${id}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlerEditSizesModal = (size: SizeDTO) => {
    setStateSize(size)
    editSizeModalHandlers.open()
  }

  //*   Delete Handlers
  const handleDelete = (size: SizeDTO) => {
    if (size.count !== 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'سایز مد نظر دارایی محصول مرتبط است',
        })
      )
    } else {
      setDeleteInfo({ id: size.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteSize({ id: deleteInfo.id })
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

  return (
    <ProtectedRouteWrapper>
      <>
        {/* Handle Delete Response */}
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

        <SizeModal
          title="افزودن"
          refetch={refetch}
          isShow={isShowSizesModal}
          onClose={() => {
            sizeModalHandlers.close()
          }}
        />

        <SizeModal
          title="ویرایش"
          refetch={refetch}
          size={stateSize}
          isShow={isShowEditSizeModal}
          onClose={() => {
            editSizeModalHandlers.close()
          }}
        />

        <ConfirmDeleteModal
          deleted
          title="مقدار ویژگی"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />

        <DashboardLayout>
          <TabDashboardLayout>
            <Head>
              <title> مقدار های سایزبندی</title>
            </Head>

            <div id="_adminSizes">
              <div className="flex gap-y-4 pt-4 px-6 sm:flex-row flex-col items-center justify-between">
                <div className="flex gap-2">
                  پیکربندی <div className="text-sky-500">سایزبندی</div>
                </div>
                <div className="flex flex-col xs:flex-row items-center gap-4">
                  <Button
                    onClick={sizeModalHandlers.open}
                    className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                  >
                    افزودن مقدار
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
              <hr className="mt-5 mb-6" />
              <div className="px-3">
                <DataStateDisplay
                  {...sizesQueryProps}
                  refetch={refetch}
                  dataLength={(sizeDb && sizeDb?.data?.data?.length) || 0}
                  emptyComponent={<EmptyCustomList />}
                  loadingComponent={<TableSkeleton count={4} />}
                >
                  <table className="w-[700px] md:w-full mx-auto">
                    <thead className="bg-sky-300">
                      <tr>
                        <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[150px] text-start">
                          <div className="pr-2">نام</div>
                        </th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">محصولات مرتبط</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">توضیحات</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeDb?.data?.data &&
                        sizeDb?.data?.data.map((size, index) => {
                          return (
                            <tr key={size.id} className={`h-16 border-b ${index % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                              <td className="text-start">
                                <div
                                  className="text-sm px-2"
                                >
                                  {digitsEnToFa(size.name)}
                                </div>
                              </td>
                              <td className="text-center">
                                <div onClick={() => handleChangePage(size.id)} className="text-sky-500 cursor-pointer">
                                  {digitsEnToFa(size.count ?? 0)}
                                </div>
                              </td>

                              <td className="text-center text-sm text-gray-600">
                                <div className="cursor-pointer">{size.description !== '' ? '✓' : '-'}</div>
                              </td>

                              {/* <td className="text-center text-sm text-gray-600">
                                <div className="flex justify-center">
                                  <Button
                                    className="bg-white text-red-600 hover:text-white border border-red-600 hover:bg-red-600 px-4 py-2 "
                                    onClick={() => handleDelete(size)}
                                  >
                                    حذف
                                  </Button>
                                </div>
                              </td> */}
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
                                                handlerEditSizesModal(size)
                                                close()
                                              }}
                                              className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                            >
                                              <span>ویرایش</span>
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDelete(size)
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

                {sizeDb?.data?.data && sizeDb?.data?.data?.length > 0 && sizeDb.data?.data && (
                  <div className="mx-auto py-4 lg:max-w-5xl">
                    <Pagination pagination={sizeDb?.data} section="_adminSizes" client />
                  </div>
                )}
              </div>
            </div>
          </TabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Sizes), { ssr: false })
