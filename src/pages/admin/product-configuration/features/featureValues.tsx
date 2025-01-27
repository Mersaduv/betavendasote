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
  useGetAllCategoriesQuery,
  useGetFeatureQuery,
  useGetFeaturesQuery,
  useGetFeatureValuesQuery,
  useGetParenSubCategoriesQuery,
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
  SizesModal,
} from '@/components/modals'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { useDispatch } from 'react-redux'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ParentSubCategoriesTree } from '@/components/categories'
import { FeatureValue, ProductFeature } from '@/services/feature/types'
import { showAlert } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

const FeatureValues: NextPage = () => {
  // States
  const [isShowFeatureValuesModal, featureValuesModalHandlers] = useDisclosure()
  const [isShowEditFeatureValuesModal, editFeatureValuesModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFeatureValue, setStateFeatureValue] = useState<FeatureValue>()
  // ? Assets
  const { query, push } = useRouter()
  const featureValuesPage = query.page ? +query.page : 1
  const featureIds = typeof query.featureIds === 'string' ? query.featureIds.split(',') : undefined

  const dispatch = useAppDispatch()
  // ? Features Query
  const {
    data: featureValuesData,
    refetch,
    ...featureValuesQueryProps
  } = useGetFeatureValuesQuery({
    pageSize: 8,
    page: featureValuesPage,
    search: searchTerm,
    featureIds: featureIds,
  })

  const { data: featureDb } = useGetFeatureQuery(featureIds !== undefined ? featureIds[0] : '')
  //*    Delete Category
  const [
    deleteFeatureValues,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteFeatureValueMutation()

  const handleChangePage = (id: string) => {
    push(`/admin/products?featureValueIds=${id}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlerEditFeatureValuesModal = (feature: FeatureValue) => {
    setStateFeatureValue(feature)
    editFeatureValuesModalHandlers.open()
  }

  //*   Delete Handlers
  const handleDelete = (featureValue: FeatureValue) => {
    if (featureValue.count !== 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'مقدار ویژگی مد نظر دارایی محصول مرتبط است',
        })
      )
    } else {
      setDeleteInfo({ id: featureValue.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteFeatureValues(deleteInfo.id)
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

        <FeatureValueModal
          title="افزودن"
          refetch={refetch}
          isShow={isShowFeatureValuesModal}
          productFeature={featureDb?.data}
          onClose={() => {
            featureValuesModalHandlers.close()
          }}
        />

        <FeatureValueModal
          title="ویرایش"
          refetch={refetch}
          featureValue={stateFeatureValue}
          productFeature={featureDb?.data}
          isShow={isShowEditFeatureValuesModal}
          onClose={() => {
            editFeatureValuesModalHandlers.close()
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
              <title>مقدار های ویژگی محصولات</title>
            </Head>

            <div id="_adminFeatureValues">
              <div className="flex gap-y-4 pt-4 px-6 sm:flex-row flex-col items-center justify-between">
                <div className="flex gap-2">
                  پیکربندی <div className="text-sky-500">{featureDb?.data?.name}</div>
                </div>
                <div className="flex flex-col xs:flex-row items-center gap-4">
                  <Button
                    onClick={featureValuesModalHandlers.open}
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
                  {...featureValuesQueryProps}
                  refetch={refetch}
                  dataLength={(featureValuesData && featureValuesData?.data?.data?.length) || 0}
                  emptyComponent={<EmptyCustomList />}
                  loadingComponent={<TableSkeleton count={4} />}
                >
                  <table className="w-[700px] md:w-full mx-auto">
                    <thead className="bg-sky-300">
                      <tr>
                        <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[150px] text-start">
                          <div className="pr-2">نام</div>
                        </th>
                        {featureValuesData?.data?.data?.some((value) => value.hexCode !== null) ? (
                          <th className="text-sm py-3 px-2 text-gray-600 font-normal">رنگ</th>
                        ) : null}
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">محصولات مرتبط</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">توضیحات</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureValuesData?.data?.data &&
                        featureValuesData?.data?.data.map((featureValue, index) => {
                          console.log(featureValue)

                          return (
                            <tr
                              key={featureValue.id}
                              className={`h-16 border-b ${index % 2 !== 0 ? 'bg-gray-50' : ''}`}
                            >
                              <td className="text-start">
                                <div
                                  onClick={() => handlerEditFeatureValuesModal(featureValue)}
                                  className="text-sm text-sky-500 cursor-pointer px-2"
                                >
                                  {featureValue.name}
                                </div>
                              </td>
                              {featureValue.hexCode !== null && (
                                <td className="text-center">
                                  <div className="flex justify-center">
                                    <div
                                      className="w-8 h-8 rounded border border-black"
                                      style={{ backgroundColor: featureValue.hexCode }}
                                    ></div>
                                  </div>
                                </td>
                              )}
                              <td className="text-center">
                                <div
                                  onClick={() => handleChangePage(featureValue.id)}
                                  className="text-sky-500 cursor-pointer"
                                >
                                  {digitsEnToFa(featureValue.count ?? 0)}
                                </div>
                              </td>

                              <td className="text-center text-sm text-gray-600">
                                <div className="cursor-pointer">{featureValue.description !== '' ? '✓' : '-'}</div>
                              </td>

                              <td className="text-center text-sm text-gray-600">
                                <div className="flex justify-center">
                                  <Button
                                    className="bg-white text-red-600 hover:text-white border border-red-600 hover:bg-red-600 px-4 py-2 "
                                    onClick={() => handleDelete(featureValue)}
                                  >
                                    حذف
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </DataStateDisplay>

                {featureValuesData?.data?.data &&
                  featureValuesData?.data?.data?.length > 0 &&
                  featureValuesData.data?.data && (
                    <div className="mx-auto py-4 lg:max-w-5xl">
                      <Pagination pagination={featureValuesData?.data} section="_adminFeatureValues" client />
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

export default dynamic(() => Promise.resolve(FeatureValues), { ssr: false })
