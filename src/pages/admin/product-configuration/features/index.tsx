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
  useGetAllCategoriesQuery,
  useGetFeaturesQuery,
  useGetParenSubCategoriesQuery,
  useGetProductsQuery,
  useGetSizesQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { ICategory, IProduct, IStockItem } from '@/types'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { CategoryModal, CategoryUpdateModal, ConfirmDeleteModal, FeatureModal, SizesModal } from '@/components/modals'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { useDispatch } from 'react-redux'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ParentSubCategoriesTree } from '@/components/categories'
import { FeatureValue, ProductFeature } from '@/services/feature/types'
import { showAlert } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

const Features: NextPage = () => {
  // States
  const [isShowFeatureModal, featureModalHandlers] = useDisclosure()
  const [isShowEditFeatureModal, editFeatureModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [featureValue, setFeatureValue] = useState<ICategory | undefined>(undefined)
  const [isShowSubFeature, setIsShowSubFeature] = useState(false)

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFeature, setStateFeature] = useState<ProductFeature>()
  // ? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const featurePage = query.page ? +query.page : 1
  // ? Features Query
  const {
    data: featureData,
    refetch,
    ...featuresQueryProps
  } = useGetFeaturesQuery({
    pageSize: 8,
    page: featurePage,
    search: searchTerm,
  })

  const { data: productList } = useGetProductsQuery({ pageSize: 9999999 })
  const { data: sizeDb } = useGetSizesQuery({ pageSize: 9999999 })

  const productWithSizeIds =
    productList?.data?.pagination.data?.filter((product: IProduct) =>
      product.stockItems.some((item: IStockItem) => item.sizeId !== null && item.sizeId !== '')
    ) || null

  //*    Delete Category
  const [
    deleteFeature,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteFeatureMutation()

  const handleChangePage = (id: string) => {
    push(`/admin/products?featureIds=${id}`)
  }

  const handleSizeChangePage = (productWithSizeIds: IProduct[] | null) => {
    push(`/admin/products?productIds=${productWithSizeIds?.map((x) => x.id)}`)
  }

  const handleChangeRoute = (id: string) => {
    push(`/admin/product-configuration/features/featureValues?featureIds=${id}`)
  }

  const handleSizeChangeRoute = () => {
    push(`/admin/product-configuration/features/sizes`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlerEditFeatureModal = (feature: ProductFeature) => {
    if (feature.name !== 'رنگ') {
      setStateFeature(feature)
      editFeatureModalHandlers.open()
    }
  }

  //*   Delete Handlers
  const handleDelete = (feature: ProductFeature) => {
    if (feature.count !== 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'ویژگی مد نظر دارایی محصول مرتبط است',
        })
      )
    } else {
      setDeleteInfo({ id: feature.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteFeature(deleteInfo.id)
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
  const shouldHideSizeRow = searchTerm !== '' && !searchTerm.includes('س')
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

        <FeatureModal
          title="افزودن ویژگی"
          refetch={refetch}
          isShow={isShowFeatureModal}
          onClose={() => {
            featureModalHandlers.close()
          }}
        />

        <FeatureModal
          title="بروزرسانی"
          refetch={refetch}
          feature={stateFeature}
          isShow={isShowEditFeatureModal}
          onClose={() => {
            editFeatureModalHandlers.close()
          }}
        />

        <ConfirmDeleteModal
          deleted
          title="ویژگی"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />

        <DashboardLayout>
          <TabDashboardLayout>
            <Head>
              <title> ویژگی محصولات</title>
            </Head>

            <div id="_adminFeatures">
              <div className="flex gap-y-4 pt-4 px-6 sm:flex-row flex-col items-center justify-between">
                <h3>ویژگی محصولات</h3>
                <div className="flex flex-col xs:flex-row items-center gap-4">
                  <Button
                    onClick={featureModalHandlers.open}
                    className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                  >
                    افزودن ویژگی
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
                  {...featuresQueryProps}
                  refetch={refetch}
                  dataLength={(featureData && featureData?.data?.data?.length) || 0}
                  emptyComponent={<EmptyCustomList />}
                  loadingComponent={<TableSkeleton count={4} />}
                >
                  <table className="w-[700px] md:w-full mx-auto">
                    <thead className="bg-sky-300">
                      <tr>
                        <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[150px] text-start">
                          <div className="pr-2">نام ویژگی</div>
                        </th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">مقدار</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/4">محصولات مرتبط</th>
                        <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featurePage === 1 && (
                        <tr className={`h-16 border-b bg-gray-50 ${shouldHideSizeRow ? 'hidden' : ''}`}>
                          <td className="text-start">
                            <div className="text-sm px-2">سایزبندی</div>
                          </td>
                          <td className="text-center">
                            <div className="">{digitsEnToFa(sizeDb?.data?.data?.length ?? 0)}</div>
                          </td>
                          <td className="text-center text-sm text-gray-600">
                            <div
                              onClick={() => handleSizeChangePage(productWithSizeIds)}
                              className="text-sky-500 cursor-pointer"
                            >
                              {digitsEnToFa(productWithSizeIds?.length ?? 0)}
                            </div>
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
                                    <button
                                      onClick={handleSizeChangeRoute}
                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                    >
                                      <span>پیکربندی</span>
                                    </button>
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </td>
                        </tr>
                      )}
                      {featureData?.data?.data &&
                        featureData?.data?.data.map((feature, index) => {
                          return (
                            <tr key={feature.id} className={`h-16 border-b ${index % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                              <td className="text-start">
                                <div
                                  className={`text-sm ${feature.name === 'رنگ' ? '' : ' '}   px-2`}
                                >
                                  {feature.name}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="">{digitsEnToFa(feature.valueCount)}</div>
                              </td>
                              <td className="text-center text-sm text-gray-600">
                                <div
                                  className="text-sky-500 cursor-pointer"
                                  onClick={() => handleChangePage(feature.id)}
                                >
                                  {digitsEnToFa(feature.count)}
                                </div>
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
                                        <>
                                        {feature.name === 'رنگ' ? null : (
                                            <button
                                              onClick={() => handlerEditFeatureModal(feature)}
                                              className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                            >
                                              <span>ویرایش</span>
                                            </button>
                                          )}
                                          <button
                                            onClick={() => handleChangeRoute(feature.id)}
                                            className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                          >
                                            <span>پیکربندی</span>
                                          </button>
                                          {feature.name === 'رنگ' ? null : (
                                            <button
                                              onClick={() => handleDelete(feature)}
                                              className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                            >
                                              <span>حذف</span>
                                            </button>
                                          )}
                                        </>
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

                {featureData?.data?.data && featureData?.data?.data?.length > 0 && featureData.data?.data && (
                  <div className="mx-auto py-4 lg:max-w-5xl">
                    <Pagination pagination={featureData?.data} section="_adminFeatures" client />
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

export default dynamic(() => Promise.resolve(Features), { ssr: false })
