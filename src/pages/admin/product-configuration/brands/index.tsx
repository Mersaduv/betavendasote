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
  useDeleteBrandMutation,
  useDeleteCategoryMutation,
  useDeleteFeatureMutation,
  useGetAllCategoriesQuery,
  useGetBrandsQuery,
  useGetFeaturesQuery,
  useGetParenSubCategoriesQuery,
} from '@/services'
import { useRouter } from 'next/router'
import { IBrand, ICategory } from '@/types'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import {
  BrandModal,
  CategoryModal,
  CategoryUpdateModal,
  ConfirmDeleteModal,
  FeatureModal,
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
import { GetBrandsResult } from '@/services/brand/types'
import { ProtectedRouteWrapper } from '@/components/user'

const Brands: NextPage = () => {
  // States
  const [isShowBrandModal, brandModalHandlers] = useDisclosure()
  const [isShowEditBrandModal, editBrandModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()

  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateBrand, setStateBrand] = useState<IBrand>()
  const [brandTabKey, setBrandTabKey] = useState('allBrands')

  // ? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const brandPage = query.page ? +query.page : 1
  // ? brands Query
  const [brandsPagination, setBrandsPagination] = useState<GetBrandsResult>()
  const [brandsActivePagination, setBrandsActivePagination] = useState<GetBrandsResult>()
  const [brandsInActivePagination, setBrandsInActivePagination] = useState<GetBrandsResult>()
  const [brandsIsActiveSliderPagination, setBrandsIsActiveSliderPagination] = useState<GetBrandsResult>()
  // const {
  //   data: brandData,
  //   refetch,
  //   ...brandsQueryProps
  // } = useGetBrandsQuery({
  //   pageSize: 20,
  //   page: brandPage,
  //   search: searchTerm,
  // })
  const useFetchBrands = (status: string) => {
    const commonBrandQueryParams = {
      pageSize: 8,
      page: brandPage,
      search: searchTerm,
      isActive: status === 'isActive',
      inActive: status === 'inActive',
      isDeleted: status === 'isDeleted',
      isActiveSlider: status === 'isActiveSlider',
    }

    const { data, isError, isFetching, isSuccess, refetch } = useGetBrandsQuery({ ...commonBrandQueryParams })

    return {
      data,
      isError,
      isFetching,
      isSuccess,
      refetch,
    }
  }

  const {
    data: allBrands,
    isError: isAllBrandsError,
    isFetching: isAllBrandsFetching,
    isSuccess: isAllBrandsSuccess,
    refetch: refetchAllBrands,
  } = useFetchBrands('allBrands')

  const {
    data: activeBrands,
    isError: isActiveBrandsError,
    isFetching: isActiveBrandsFetching,
    isSuccess: isActiveBrandsSuccess,
    refetch: refetchActiveBrands,
  } = useFetchBrands('isActive')

  const {
    data: inactiveBrands,
    isError: isInactiveBrandsError,
    isFetching: isInactiveBrandsFetching,
    isSuccess: isInactiveBrandsSuccess,
    refetch: refetchInactiveBrands,
  } = useFetchBrands('inActive')

  useEffect(() => {
    if (allBrands) {
      setBrandsPagination(allBrands)
    }
  }, [allBrands])

  useEffect(() => {
    if (activeBrands) {
      setBrandsActivePagination(activeBrands)
    }
  }, [activeBrands])

  useEffect(() => {
    if (inactiveBrands) {
      setBrandsInActivePagination(inactiveBrands)
    }
  }, [inactiveBrands])
  //*    Delete Category
  const [
    deleteBrand,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteBrandMutation()

  const handleChangePage = (id: string) => {
    push(`/admin/products?brands=${id}`)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handlerEditBrandModal = (brand: IBrand) => {
    setStateBrand(brand)
    editBrandModalHandlers.open()
  }

  //*   Delete Handlers
  const handleDelete = (brand: IBrand) => {
    if (brand.count !== 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'برند مد نظر دارایی محصول مرتبط است',
        })
      )
    } else {
      setDeleteInfo({ id: brand.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteBrand({ id: deleteInfo.id })
  }

  const onSuccess = () => {
    handleAllRefetch()
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }
  const onError = () => {
    confirmDeleteModalHandlers.close()
    setDeleteInfo({ id: '' })
  }

  const handleAllRefetch = () => {
    refetchAllBrands()
    refetchInactiveBrands()
    refetchActiveBrands()
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

        <BrandModal
          title="افزودن"
          mode="create"
          refetch={handleAllRefetch}
          isShow={isShowBrandModal}
          onClose={() => {
            brandModalHandlers.close()
          }}
        />

        <BrandModal
          title="ویرایش"
          mode="edit"
          refetch={handleAllRefetch}
          brand={stateBrand}
          isShow={isShowEditBrandModal}
          onClose={() => {
            editBrandModalHandlers.close()
          }}
        />

        <ConfirmDeleteModal
          deleted
          title="برند"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />

        <DashboardLayout>
          <TabDashboardLayout>
            <Head>
              <title> برندها</title>
            </Head>

            <div id="_adminBrands">
              <div className="">
                <Tab.Group
                  selectedIndex={
                    brandTabKey === 'allBrands'
                      ? 0
                      : brandTabKey === 'activeBrands'
                      ? 1
                      : brandTabKey === 'inactiveBrands'
                      ? 2
                      : brandTabKey === 'activeSliderBrands'
                      ? 3
                      : 0
                  }
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setBrandTabKey('allBrands')
                        break
                      case 1:
                        setBrandTabKey('activeBrands')
                        break
                      case 2:
                        setBrandTabKey('inactiveBrands')
                        break
                      default:
                        setBrandTabKey('allBrands')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between px-2 py-4 border-b gap-4 border-gray-200 overflow-auto">
                    <div className="flex flex-col items-start justify-center">
                      <h2 className="pr-4 pb-2">برندها</h2>
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          همه ({digitsEnToFa(brandsPagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          فعال ({digitsEnToFa(brandsActivePagination?.data?.totalCount ?? 0)})
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap ${
                              selected ? 'text-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 rounded cursor-pointer text-sm`
                          }
                        >
                          غیرفعال ({digitsEnToFa(brandsInActivePagination?.data?.totalCount ?? 0)})
                        </Tab>
                      </div>
                    </div>{' '}
                    <div className="flex items-end px-3 pr-3 xl2:pr-0 gap-y-4 sm:flex-row flex-col justify-between">
                      <div className="flex flex-col xs:flex-row items-center gap-4">
                        <Button
                          onClick={brandModalHandlers.open}
                          className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                        >
                          افزودن برند
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
                      <div id="_adminBrandsAll">
                        <DataStateDisplay
                          isError={isAllBrandsError}
                          refetch={refetchAllBrands}
                          isFetching={isAllBrandsFetching}
                          isSuccess={isAllBrandsSuccess}
                          dataLength={brandsPagination?.data?.data ? brandsPagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">تصویر</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام فارسی</div>
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام انگلیسی</div>
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">توضیحات</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">محصولات مرتبط</th>

                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brandsPagination?.data?.data &&
                                brandsPagination?.data?.data.map((brand, index) => {
                                  return (
                                    <tr
                                      key={brand.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="">
                                        <div className="w-full flex justify-center">
                                          <img
                                            className="w-[100px] object-contain rounded-lg h-[70px]"
                                            src={brand.imagesSrc.imageUrl}
                                            alt={brand.nameFa}
                                          />
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div
                                         
                                          className="text-sm px-2"
                                        >
                                          {brand.nameFa}
                                        </div>
                                      </td>

                                      <td className="text-center">
                                        <div className="text-sm  px-2">{brand.nameEn}</div>
                                      </td>

                                      <td className="text-center">
                                        <div className="">{brand.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        <div
                                          className="text-sky-500 cursor-pointer"
                                          onClick={() => handleChangePage(brand.id)}
                                        >
                                          {digitsEnToFa(brand.count)}
                                        </div>
                                      </td>

                                      <td className="text-center">
                                        <div>
                                          {brand.isActive ? (
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
                                                        handlerEditBrandModal(brand)
                                                        close()
                                                      }}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>ویرایش</span>
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        handleDelete(brand)
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

                        {brandsPagination?.data?.data &&
                          brandsPagination?.data?.data?.length > 0 &&
                          brandsPagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination pagination={brandsPagination?.data} section="_adminBrands" client />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminActiveBrands">
                        <DataStateDisplay
                          isError={isActiveBrandsError}
                          refetch={refetchActiveBrands}
                          isFetching={isActiveBrandsFetching}
                          isSuccess={isActiveBrandsSuccess}
                          dataLength={brandsActivePagination?.data?.data ? brandsActivePagination.data?.data.length : 0}
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">تصویر</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام برند</div>
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام انگلیسی</div>
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">توضیحات</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">محصولات مرتبط</th>

                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brandsActivePagination?.data?.data &&
                                brandsActivePagination?.data?.data.map((brand, index) => {
                                  return (
                                    <tr
                                      key={brand.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="">
                                        <div className="w-full flex justify-center">
                                          <img
                                            className="w-[100px] object-contain rounded-lg h-[70px]"
                                            src={brand.imagesSrc.imageUrl}
                                            alt={brand.nameFa}
                                          />
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div
                                          onClick={() => handlerEditBrandModal(brand)}
                                          className="text-sm text-sky-500 cursor-pointer px-2"
                                        >
                                          {brand.nameFa}
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div
                                          onClick={() => handlerEditBrandModal(brand)}
                                          className="text-sm text-sky-500 cursor-pointer px-2"
                                        >
                                          {brand.nameEn}
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div className="">{brand.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        <div
                                          className="text-sky-500 cursor-pointer"
                                          onClick={() => handleChangePage(brand.id)}
                                        >
                                          {digitsEnToFa(brand.count)}
                                        </div>
                                      </td>

                                      <td className="text-center">
                                        <div>
                                          {brand.isActive ? (
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
                                                        handleDelete(brand)
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

                        {brandsActivePagination?.data?.data &&
                          brandsActivePagination?.data?.data?.length > 0 &&
                          brandsActivePagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={brandsActivePagination?.data}
                                section="_adminActiveBrands"
                                client
                              />
                            </div>
                          )}
                      </div>
                    </Tab.Panel>

                    <Tab.Panel>
                      <div id="_adminInActiveBrands">
                        <DataStateDisplay
                          isError={isInactiveBrandsError}
                          refetch={refetchInactiveBrands}
                          isFetching={isInactiveBrandsFetching}
                          isSuccess={isInactiveBrandsSuccess}
                          dataLength={
                            brandsInActivePagination?.data?.data ? brandsInActivePagination.data?.data.length : 0
                          }
                          loadingComponent={<TableSkeleton count={20} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/12">تصویر</th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام برند</div>
                                </th>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[18%] text-center">
                                  <div className="">نام انگلیسی</div>
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">توضیحات</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[18%]">محصولات مرتبط</th>

                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brandsInActivePagination?.data?.data &&
                                brandsInActivePagination?.data?.data.map((brand, index) => {
                                  return (
                                    <tr
                                      key={brand.id}
                                      className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                    >
                                      <td className="">
                                        <div className="w-full flex justify-center">
                                          <img
                                            className="w-[100px] object-contain rounded-lg h-[70px]"
                                            src={brand.imagesSrc.imageUrl}
                                            alt={brand.nameFa}
                                          />
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div
                                          onClick={() => handlerEditBrandModal(brand)}
                                          className="text-sm text-sky-500 cursor-pointer px-2"
                                        >
                                          {brand.nameFa}
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div
                                          onClick={() => handlerEditBrandModal(brand)}
                                          className="text-sm text-sky-500 cursor-pointer px-2"
                                        >
                                          {brand.nameEn}
                                        </div>
                                      </td>
                                      <td className="text-center">
                                        <div className="">{brand.description !== '' ? '✓' : '-'}</div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        <div
                                          className="text-sky-500 cursor-pointer"
                                          onClick={() => handleChangePage(brand.id)}
                                        >
                                          {digitsEnToFa(brand.count)}
                                        </div>
                                      </td>

                                      <td className="text-center">
                                        <div>
                                          {brand.isActive ? (
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
                                                        handleDelete(brand)
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

                        {brandsInActivePagination?.data?.data &&
                          brandsInActivePagination?.data?.data?.length > 0 &&
                          brandsInActivePagination.data?.data && (
                            <div className="mx-auto py-4 lg:max-w-5xl">
                              <Pagination
                                pagination={brandsInActivePagination?.data}
                                section="_adminInActiveBrands"
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
          </TabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Brands), { ssr: false })
