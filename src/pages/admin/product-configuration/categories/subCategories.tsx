import { useAppDispatch, useDisclosure } from '@/hooks'
import { ICategory } from '@/types'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { LuSearch } from 'react-icons/lu'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { ArrowRight } from '@/icons'
import { useRouter } from 'next/router'
import { useDeleteCategoryMutation, useGetParenSubCategoriesQuery, useGetSingleCategoryQuery } from '@/services'
import { showAlert } from '@/store'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import Head from 'next/head'
import { NextPage } from 'next'
import {
  ConfirmDeleteModal,
  FeaturesModal,
  SizesModal,
  SubCategoryModal,
  SubCategorySizesModal,
  SubCategoryUpdateModal,
} from '@/components/modals'
import { HandleResponse } from '@/components/shared'
import { Button } from '@/components/ui'
import { EmptyCustomList } from '@/components/emptyList'
import { ProductFeature } from '@/services/feature/types'
import SubCategorySizesUpdateModal from '@/components/modals/SubCategorySizesUpdateModal'
import { ProtectedRouteWrapper } from '@/components/user'

const ParentSubCategoriesTree: NextPage = () => {
  const { query, push } = useRouter()
  const parentId = (query.parentId as string) ?? undefined

  // States
  const [isShowSubCategoryModal, subCategoryModalHandlers] = useDisclosure()
  const [isShowEditSubCategoryModal, editSubCategoryModalHandlers] = useDisclosure()
  const [stateSubCategory, setStateSubCategory] = useState<ICategory>()
  const [isShowProductSizesModal, productSizesModalHandlers] = useDisclosure()
  const [isShowUpdateProductSizesModal, updateProductSizesModalHandlers] = useDisclosure()
  const [stateCategorySize, setStateCategorySize] = useState<ICategory>()
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState('')
  const [isShowSizesModal, sizesModalHandlers] = useDisclosure()
  const [stateCategorySizes, setStateCategorySizes] = useState<ICategory>()

  // ? Handlers
  const handlerEditSubCategoryModal = (category: ICategory) => {
    setStateSubCategory(category)
    editSubCategoryModalHandlers.open()
  }

  const handleSearchSubCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubCategorySearchTerm(event.target.value)
  }

  // ? Queries
  // Get parent Categories
  const { data: categoryParent } = useGetSingleCategoryQuery({ id: parentId! }, { skip: !parentId })

  //* Get sub Categories
  const {
    data: subCategories,
    refetch: subRefetch,
    isLoading: isLoadingSubCategory,
  } = useGetParenSubCategoriesQuery(
    {
      id: parentId,
      query: { searchTerm: subCategorySearchTerm },
    },
    {
      skip: parentId === undefined,
    }
  )

  const CategoryTree: React.FC<{ categories: ICategory[] }> = ({ categories }) => {
    const { query, push } = useRouter()
    const dispatch = useAppDispatch()
    const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
    const [isShowFeaturesModal, featuresModalHandlers] = useDisclosure()
    const [stateCategoryFeatures, setStateCategoryFeatures] = useState<ICategory>()
    const [deleteInfo, setDeleteInfo] = useState({
      id: '',
    })
    const [featureDb, setFeatureDb] = useState<ProductFeature[]>()
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

    const handleChangePage = (slugQuery: string) => {
      push(`/admin/products?categoryId=${slugQuery}`)
    }
    const handlerEditProductSizeModal = (category: ICategory) => {
      console.log(category, 'handlerEditProductSizeModal')
      if (category.productSizeId.length === 0) {
        productSizesModalHandlers.open()
      } else {
        updateProductSizesModalHandlers.open()
      }
      setStateCategorySize(category)
    }

    const handlerEditFeaturesModal = (category: ICategory) => {
      setStateCategoryFeatures(category)
      featuresModalHandlers.open()
    }

    //*   Delete Handlers
    const handleDelete = (category: ICategory) => {
      if (category.count !== 0) {
        return dispatch(
          showAlert({
            status: 'error',
            title: 'به علت داشتن محصول در این دسته بندی,امکان حذف وجود ندارد ',
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
      subRefetch()
      confirmDeleteModalHandlers.close()
      setDeleteInfo({ id: '' })
    }
    const onError = () => {
      confirmDeleteModalHandlers.close()
      setDeleteInfo({ id: '' })
    }
    const handlerEditSizeModal = (category: ICategory) => {
      setStateCategorySizes(category)
      sizesModalHandlers.open()
    }
    function handleChecked(category: ICategory) {
      var featureCategoryCount = category.hasSizeProperty ? category.featureCount + 1 : category.featureCount
      let isDone = false
      if (featureCategoryCount > 0) {
        isDone = true
      } else {
        isDone = false
      }
      return isDone
    }

    console.log(categories, 'categories')

    return (
      <ProtectedRouteWrapper>
        <>
          <FeaturesModal
            refetch={subRefetch}
            category={stateCategoryFeatures ?? undefined}
            isShow={isShowFeaturesModal}
            onClose={featuresModalHandlers.close}
            featureDb={featureDb}
            setFeatureDb={setFeatureDb}
          />
          <ConfirmDeleteModal
            deleted
            title="زیر دسته بندی"
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

          <SizesModal
            refetch={subRefetch}
            category={stateCategorySizes ?? undefined}
            isShow={isShowSizesModal}
            onClose={sizesModalHandlers.close}
          />
          <ul className="flex flex-col">
            {categories.map((category) => {
              return (
                <li key={category.id} className={`w-[850px] ${category.level > 1 ? 'mr-10' : ''}`}>
                  <div
                    className={`${
                      category.isActive ? 'bg-[#eee]' : 'bg-red-100'
                    } px-1.5 py-1 border border-[#ccc] rounded-lg mb-6 flex justify-between items-center`}
                  >
                    <div className="flex items-center gap-3">
                      <img className="w-8 h-8 object-contain" src={category.imagesSrc?.imageUrl} alt={category.name} />
                      <div
                        onClick={() => handlerEditSubCategoryModal(category)}
                        className="text-sky-500 cursor-pointer text-sm"
                      >
                        {category.name}
                      </div>
                    </div>
                    {/* buttons logic */}
                    <div className="flex gap-3.5 items-center">
                      <Button
                        disabled={!category.isActiveProduct}
                        onClick={() => handlerEditFeaturesModal(category)}
                        className={`${
                          category.isActiveProduct === true ? 'bg-sky-500' : ' bg-gray-400'
                        } text-white text-xs  font-medium rounded-md w-[70px] pr-0 pl-0 text-start whitespace-nowrap h-[10px]`}
                      >
                        ویژگی {handleChecked(category) ? <span className="pr-1.5 text-white">{'✓'}</span> : ''}
                      </Button>
                      {category.hasSizeProperty ? (
                        <Button
                          disabled={!category.isActiveProduct}
                          onClick={() => handlerEditSizeModal(category)}
                          className={` ${
                            category.isActiveProduct ? 'bg-sky-500' : ' bg-gray-400'
                          } text-white text-xs  font-medium  rounded-md w-[70px] pr-0 pl-0 text-start whitespace-nowrap h-[10px]`}
                        >
                          سایزبندی {category.sizeCount > 0 ? <span className="pr-1.5 text-white">{'✓'}</span> : ''}
                        </Button>
                      ) : null}
                      <Button
                        disabled={!category.isActiveProduct}
                        onClick={() => handlerEditProductSizeModal(category)}
                        className={` ${
                          category.isActiveProduct ? 'bg-sky-500' : ' bg-gray-400'
                        } text-white text-xs  font-medium  rounded-md w-[70px] pr-0 pl-0 text-start whitespace-nowrap h-[10px]`}
                      >
                        اندازه ها{' '}
                        {category.productSizeCount > 0 ? <span className="pr-1.5 text-white">{'✓'}</span> : ''}
                      </Button>
                      <Button
                        disabled={!category.isActiveProduct}
                        onClick={() => handlerEditFeaturesModal(category)}
                        className={` ${
                          category.isActiveProduct ? 'bg-sky-500' : ' bg-gray-400'
                        } text-white text-xs  font-medium rounded-md w-[70px] pr-0 pl-0 text-start whitespace-nowrap h-[10px]`}
                      >
                        استرداد
                      </Button>
                      <Button
                        disabled={!category.isActiveProduct}
                        onClick={() => handleChangePage(category.id)}
                        className={` ${
                          category.isActiveProduct ? 'bg-sky-500' : ' bg-gray-400'
                        } text-white text-xs  font-medium rounded-md w-[70px] pr-0 pl-0 text-start whitespace-nowrap h-[10px]`}
                      >
                        محصول {category.count > 0 ? <span className="pr-1.5 text-white">{'✓'}</span> : ''}
                      </Button>

                      <Button
                        onClick={() => handleDelete(category)}
                        className="text-white text-xs  font-medium bg-red-500 rounded-md w-[50px] px-0 text-center whitespace-nowrap py-1"
                      >
                        حذف{' '}
                      </Button>

                      <div className="pl-1 pr-0.5 py-2 cursor-grab">
                        <img className="w-4 h-4" src="/images/icons/menu-burger.png" alt="" />
                      </div>
                    </div>
                  </div>
                  {category.childCategories && category.childCategories.length > 0 && (
                    <CategoryTree categories={category.childCategories} />
                  )}
                </li>
              )
            })}
          </ul>
        </>
      </ProtectedRouteWrapper>
    )
  }

  return (
    <>
      <SubCategoryModal
        categoryParent={categoryParent?.data ?? ({} as ICategory)}
        title="افزودن زیر"
        categoryList={subCategories?.data ?? []}
        refetch={subRefetch}
        isShow={isShowSubCategoryModal}
        onClose={() => {
          subCategoryModalHandlers.close()
          setStateSubCategory(undefined)
        }}
      />

      <SubCategoryUpdateModal
        categoryParent={categoryParent?.data ?? ({} as ICategory)}
        title="ویرایش زیر"
        categoryList={subCategories?.data ?? []}
        refetch={subRefetch}
        category={stateSubCategory}
        isShow={isShowEditSubCategoryModal}
        onClose={() => {
          editSubCategoryModalHandlers.close()
        }}
      />
      <SubCategorySizesModal
        mode="create"
        refetch={subRefetch}
        category={stateCategorySize ?? undefined}
        isShow={isShowProductSizesModal}
        onClose={productSizesModalHandlers.close}
      />
      {/* <SubCategorySizesModal
        mode="edit"
        refetch={subRefetch}
        category={stateCategorySize ?? undefined}
        isShow={isShowProductSizesModal}
        onClose={productSizesModalHandlers.close}
      /> */}
      <SubCategorySizesUpdateModal
        mode="edit"
        refetch={subRefetch}
        category={stateCategorySize ?? undefined}
        isShow={isShowUpdateProductSizesModal}
        onClose={updateProductSizesModalHandlers.close}
      />
      <DashboardLayout>
        <TabDashboardLayout>
          <Head>
            <title> زیر دسته محصولات</title>
          </Head>
          <div>
            <div className="flex gap-y-4 px-6 pt-5 sm:flex-row flex-col items-center justify-between">
              <h3>
                پیکربندی <span className="text-base font-medium text-sky-500">{categoryParent?.data?.name}</span>
              </h3>
              <div className="flex flex-col xs:flex-row items-center gap-4">
                <Button
                  onClick={subCategoryModalHandlers.open}
                  className="hover:bg-sky-600 bg-sky-500 px-3 py-2.5 text-sm whitespace-nowrap"
                >
                  افزودن زیر دسته
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
                    value={subCategorySearchTerm}
                    onChange={handleSearchSubCategoryChange}
                  />
                </div>
              </div>
            </div>
            <hr className="mt-5 mb-6" />
            <div className="pr-2 xs:pr-8 sm:pr-14">
              {subCategories && subCategories.data && subCategories.data.length > 0 ? (
                <CategoryTree categories={subCategories.data} />
              ) : (
                <EmptyCustomList />
              )}
            </div>
            <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
              <span className="font-normal text-[11px] pt-2">
                برای تغییر ترتیب نمایش دسته ها ، میتوانید با کشیدن و رها کردن (drag & drop) دسته هارا مرتب کنید
              </span>
            </div>
          </div>
        </TabDashboardLayout>
      </DashboardLayout>
    </>
  )
}

export default ParentSubCategoriesTree
