import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { TableSkeleton } from '@/components/skeleton'
import { EmptyCustomList } from '@/components/emptyList'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { Menu, Transition } from '@headlessui/react'
import { ICategory } from '@/types'
import { Fragment, useEffect, useState } from 'react'
import { Pagination } from '@/components/navigation'
import { LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui'
import { ParentSubCategoriesTree } from '@/components/categories'
import { NextPage } from 'next'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { ProductFeature } from '@/services/feature/types'
import { useDeleteCategoryMutation, useGetAllCategoriesQuery, useGetParenSubCategoriesQuery } from '@/services'
import { useRouter } from 'next/router'
import { CategoryModal, CategoryUpdateModal, ConfirmDeleteModal, SizesModal, CategoryBrandsModal } from '@/components/modals'
import { showAlert } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'

const Categories: NextPage = () => {
  // States
  const [isShowSizesModal, sizesModalHandlers] = useDisclosure()
  const [isShowCategoryModal, categoryModalHandlers] = useDisclosure()
  const [isShowEditCategoryModal, editCategoryModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [isShowSubCategories, setIsShowSubCategories] = useState(false)
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [stateCategory, setStateCategory] = useState<ICategory>()
  const [stateCategorySize, setStateCategorySize] = useState<ICategory>()
  const [categoryParent, setCategoryParent] = useState<ICategory | undefined>(undefined)
  const [stateSubCategories, setStateSubCategories] = useState<ICategory[]>([])
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState('')
  const [isShowBrandsModal, brandsModalHandlers] = useDisclosure()
  const [stateCategoryBrands, setStateCategoryBrands] = useState<ICategory>()
  // ? Assets
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const categoryPage = query.page ? +query.page : 1
  const { data, refetch, ...categoriesQueryProps } = useGetAllCategoriesQuery({
    pageSize: 8,
    page: categoryPage,
    search: searchTerm,
  })

  // ? Queries
  //* Get sub Categories
  const {
    data: subCategories,
    refetch: subRefetch,
    isLoading: isLoadingSubCategory,
  } = useGetParenSubCategoriesQuery(
    {
      id: categoryParent != undefined ? categoryParent.id : undefined,
      query: { searchTerm: subCategorySearchTerm },
    },
    {
      skip: categoryParent === undefined,
    }
  )

  //*    Delete Category
  const [
    deleteCategory,
    {
      isSuccess: isSuccessDelete,
      isError: isErrorDelete,
      error: errorDelete,
      data: dataDelete,
      isLoading: isLoadingDelete,
    },
  ] = useDeleteCategoryMutation()

  useEffect(() => {
    if (subCategories) {
      setStateSubCategories(subCategories.data ?? [])
    }
  }, [subCategories])

  const countAllChildCategories = (category: ICategory | undefined): number => {
    if (!category || !category.childCategories) return 0

    let totalCount = category.childCategories.length

    for (const childCategory of category.childCategories) {
      totalCount += countAllChildCategories(childCategory)
    }

    return totalCount
  }

  // ? Handlers
  const handleSearchSubCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubCategorySearchTerm(event.target.value)
  }
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleChangePage = (slugQuery: string) => {
    push(`/admin/products?category=${slugQuery}`)
  }

  const handleChangeRoute = (id: string) => {
    push(`/admin/product-configuration/categories/subCategories?parentId=${id}`)
  }

  const handlerEditCategoryModal = (category: ICategory) => {
    setStateCategory(category)
    editCategoryModalHandlers.open()
  }

  const handlerEditSizeModal = (category: ICategory) => {
    setStateCategorySize(category)
    sizesModalHandlers.open()
  }

  //*   Delete Handlers
  const handleDelete = (category: ICategory) => {
    if (category.count !== 0) {
      return dispatch(
        showAlert({
          status: 'error',
          title: 'دسته بندی مد نظر دارایی محصول مرتبط است',
        })
      )
    } else {
      setDeleteInfo({ id: category.id })
      confirmDeleteModalHandlers.open()
    }
  }

  const onCancel = () => {
    setDeleteInfo({ id: '' })
    confirmDeleteModalHandlers.close()
  }

  const onConfirm = () => {
    deleteCategory({ id: deleteInfo.id })
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

  const handleChangeRouteToSubCategories = (categoryParent: ICategory) => {
    setIsShowSubCategories(true)
    setCategoryParent(categoryParent)
  }

  const handlerEditBrandsModal = (category: ICategory) => {
      setStateCategoryBrands(category)
      brandsModalHandlers.open()
    }
  return (
    <ProtectedRouteWrapper>
      <>
        <ConfirmDeleteModal
          deleted
          title="دسته بندی"
          isLoading={isLoadingDelete}
          isShow={isShowConfirmDeleteModal}
          onClose={confirmDeleteModalHandlers.close}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
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

        <CategoryModal
          title="افزودن"
          mode="create"
          refetch={refetch}
          isShow={isShowCategoryModal}
          onClose={() => {
            categoryModalHandlers.close()
            setStateCategory(undefined)
          }}
        />

        <CategoryUpdateModal
          title="ویرایش"
          mode="edit"
          refetch={refetch}
          category={stateCategory}
          isShow={isShowEditCategoryModal}
          onClose={() => {
            editCategoryModalHandlers.close()
          }}
        />

        <SizesModal
          refetch={refetch}
          category={stateCategorySize ?? undefined}
          isShow={isShowSizesModal}
          onClose={sizesModalHandlers.close}
        />

        <CategoryBrandsModal
          brands={stateCategoryBrands?.brands ?? undefined}
          refetch={refetch}
          category={stateCategoryBrands ?? undefined}
          isShow={isShowBrandsModal}
          onClose={brandsModalHandlers.close}
        />

        <DashboardLayout>
          <TabDashboardLayout>
            <Head>
              <title> دسته بندی محصولات</title>
            </Head>
            <div className="flex gap-y-4 pt-4 sm:flex-row flex-col items-center w-full">
              <div className="w-full">
                <div id="_adminCategories">
                  <div className="flex gap-y-4 px-6 sm:flex-row flex-col items-center justify-between">
                    <h3>دسته بندی محصولات</h3>
                    <div className="flex flex-col xs:flex-row items-center gap-4">
                      <Button
                        onClick={categoryModalHandlers.open}
                        className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                      >
                        افزودن دسته بندی
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
                      {...categoriesQueryProps}
                      refetch={refetch}
                      dataLength={(data && data?.data?.data?.length) || 0}
                      emptyComponent={<EmptyCustomList />}
                      loadingComponent={<TableSkeleton count={4} />}
                    >
                      <table className="w-[700px] md:w-full mx-auto">
                        <thead className="bg-sky-300">
                          <tr>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal w-[70px] text-center">تصویر</th>
                            <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[150px] text-center">
                              نام
                            </th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">زیردسته</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">برند</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">محصولات مرتبط</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                            <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.data?.data &&
                            data?.data?.data.map((category, index) => (
                              <tr key={category.id} className={`h-16 border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <td className="">
                                  <img
                                    className="w-[50px] h-[50px] object-contain rounded mr-2"
                                    src={category.imagesSrc?.imageUrl}
                                    alt="p-img"
                                  />
                                </td>
                                <td className="text-center">
                                  <div
                                    onClick={() => handlerEditCategoryModal(category)}
                                    className="text-sm text-sky-500 cursor-pointer "
                                  >
                                    {category.name}
                                  </div>
                                </td>
                                <td className="text-center text-sm text-gray-600">
                                  {digitsEnToFa(countAllChildCategories(category))}
                                </td>
                                <td onClick={() => handlerEditBrandsModal(category)} className="text-center text-sm text-sky-500 cursor-pointer farsi-digits">
                                  {category.brands.length}
                                </td>
                                <td className="text-center text-sm text-gray-600">
                                  <div
                                    className="text-sky-500 cursor-pointer"
                                    onClick={() => handleChangePage(category.slug)}
                                  >
                                    {digitsEnToFa(category.count)}
                                  </div>
                                </td>
                                <td className="text-center">
                                  {category.isActive ? (
                                    <span className="text-sm text-green-500">فعال</span>
                                  ) : (
                                    <span className="text-sm text-red-500">غیر فعال</span>
                                  )}
                                </td>
                                <td className="text-center text-sm text-gray-600">
                                  <Menu key={category.id} as="div" className={`dropdown`}>
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
                                          {/* <>
                                          <button
                                            onClick={() => handleChangeRoute(category.id)}
                                            className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                          >
                                            <span>پیکربندی</span>
                                          </button>

                                          <button
                                            onClick={() => handleDelete(category)}
                                            className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                          >
                                            <span>حذف</span>
                                          </button>
                                        </> */}
                                          {({ close }) => (
                                            <>
                                              <button
                                                onClick={() => {
                                                  handleChangeRoute(category.id)
                                                  close()
                                                }}
                                                className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                              >
                                                <span>پیکربندی</span>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  handleDelete(category)
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
                            ))}
                        </tbody>
                      </table>
                    </DataStateDisplay>

                    {data?.data?.data && data?.data?.data?.length > 0 && data.data?.data && (
                      <div className="mx-auto py-4 lg:max-w-5xl">
                        <Pagination pagination={data?.data} section="_adminCategories" client />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabDashboardLayout>
        </DashboardLayout>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(Categories), { ssr: false })
