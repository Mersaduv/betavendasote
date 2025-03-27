import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout, TabDashboardLayout } from '@/components/Layouts'
import { ProtectedRouteWrapper } from '@/components/user'
import { Menu, Tab, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { jewelryFormValidationSchema } from '@/utils/validation'
import { IJewelryForm } from '@/types/forms.type'
import { Button, TextField } from '@/components/ui'
import { ICategory } from '@/types'
import {
  useDeleteFeatureMutation,
  useGetAllCategoriesQuery,
  useGetCategoriesTreeQuery,
  useGetFeaturesQuery,
} from '@/services'
import { BrandsCombobox } from '@/components/selectorCombobox'
import CategoriesCombobox from '@/components/selectorCombobox/CategoriesCombobox'
import { DataStateDisplay, HandleResponse } from '@/components/shared'
import { EmptyCustomList } from '@/components/emptyList'
import { TableSkeleton } from '@/components/skeleton'
import { showAlert } from '@/store/slices/alert.slice'
import { ProductFeature } from '@/services/feature/types'
import { useRouter } from 'next/router'
import { useAppDispatch, useDisclosure } from '@/hooks'
import { ConfirmDeleteModal, FeatureModal } from '@/components/modals'
import { LuSearch } from 'react-icons/lu'
import { Pagination } from '@/components/navigation'
const extractChildCategories = (category: ICategory): ICategory[] => {
  let childCategories: ICategory[] = []
  if (category.childCategories && category.childCategories.length > 0) {
    category.childCategories.forEach((child) => {
      childCategories.push(child)
      childCategories = childCategories.concat(extractChildCategories(child))
    })
  }
  return childCategories
}
const Jewelry = () => {
  const dispatch = useAppDispatch()
  const { query, push } = useRouter()
  const [tabKey, setTabKey] = useState('gold')
  const [stateCategory, setStateCategory] = useState<ICategory[]>([])
  const [categoryDb, setCategoryDb] = useState<ICategory[]>()
  const [stateFeature, setStateFeature] = useState<ProductFeature>()
  const [searchTerm, setSearchTerm] = useState('')
  const [isShowFeatureModal, featureModalHandlers] = useDisclosure()
  const [isShowEditFeatureModal, editFeatureModalHandlers] = useDisclosure()
  const [isShowConfirmDeleteModal, confirmDeleteModalHandlers] = useDisclosure()
  const [deleteInfo, setDeleteInfo] = useState({
    id: '',
  })
  const featurePage = query.page ? +query.page : 1

  const { categoriesData } = useGetCategoriesTreeQuery(undefined, {
    selectFromResult: ({ data }) => ({
      categoriesData: data?.data,
    }),
  })

  const {
    data: featureData,
    refetch,
    ...featuresQueryProps
  } = useGetFeaturesQuery({
    pageSize: 8,
    page: featurePage,
    search: searchTerm,
  })

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

  useEffect(() => {
    if (categoriesData) {
      let allCats: ICategory[] = []
      categoriesData.forEach((category: ICategory) => {
        allCats.push(category)
        allCats = allCats.concat(extractChildCategories(category))
      })
      setCategoryDb(allCats)
    }
  }, [categoriesData])

  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
    reset,
    setValue,
    watch,
  } = useForm<IJewelryForm>({
    resolver: yupResolver(jewelryFormValidationSchema),
    mode: 'onChange',
  })

  const onSubmit = (data: IJewelryForm) => {
    console.log(data)
  }

  // ? Handlers
  const handleCategorySelect = (categories: ICategory[]) => {
    setStateCategory((prevState) => {
      const newState = prevState.filter((item) => categories.some((category) => category.id === item.id))
      categories.forEach((category) => {
        if (!newState.some((item) => item.id === category.id)) {
          newState.push(category)
        }
      })
      return newState
    })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleChangePage = (id: string) => {
    push(`/admin/products?featureIds=${id}`)
  }

  const handlerEditFeatureModal = (feature: ProductFeature) => {
    setStateFeature(feature)
    editFeatureModalHandlers.open()
  }

  const handleChangeRoute = (id: string) => {
    push(`/admin/product-configuration/features/featureValues?featureIds=${id}`)
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
          <TabDashboardLayout jewelry>
            <Head>
              <title>مدیریت | زیورالات</title>
            </Head>
            <div className="relative">
              <div className="p-6 border-b">
                <h3>زیورالات</h3>
              </div>
              <div className="p-6">
                <Tab.Group
                  selectedIndex={tabKey === 'gold' ? 0 : tabKey === 'silver' ? 1 : tabKey === 'features' ? 2 : 0}
                  onChange={(index) => {
                    switch (index) {
                      case 0:
                        setTabKey('gold')
                        break
                      case 1:
                        setTabKey('silver')
                        break
                      case 2:
                        setTabKey('features')
                        break
                      default:
                        setTabKey('gold')
                    }
                  }}
                >
                  <Tab.List className="flex flex-col xl2:flex-row justify-between border-b gap-4 border-gray-200">
                    <div className="flex flex-col items-start justify-center">
                      <div className="flex items-center">
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap border-b -mb-[1px] ${
                              selected ? 'text-sky-500  border-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 cursor-pointer text-sm`
                          }
                        >
                          طلا
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap border-b -mb-[1px] ${
                              selected ? 'text-sky-500  border-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 cursor-pointer text-sm`
                          }
                        >
                          نقره
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            `whitespace-nowrap border-b -mb-[1px] ${
                              selected ? 'text-sky-500  border-sky-500' : 'hover:text-sky-500'
                            } px-4 py-2 cursor-pointer text-sm`
                          }
                        >
                          ویژگی ها
                        </Tab>
                      </div>
                    </div>{' '}
                  </Tab.List>
                  <Tab.Panels className="mt-3 rounded-xl bg-white pt-2">
                    <Tab.Panel>
                      <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                          <div className="flex gap-4">
                            <div className="flex-1 w-full">
                              <Controller
                                name="percentageTax"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="درصد مالیات"
                                    control={control}
                                    errors={errors.percentageTax}
                                    name="percentageTax"
                                    isDark
                                    inputMode="numeric"
                                  />
                                )}
                              />
                            </div>
                            <div className="w-full flex-1">
                              <span>دسته بندی محصول مرتبط</span>
                              <div className="w-full pt-2">
                                <CategoriesCombobox
                                  onCategorySelect={handleCategorySelect}
                                  categoryList={categoryDb}
                                  stateCategoryData={stateCategory}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 w-full">
                              <Controller
                                name="gold18KPrice"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="قیمت طلای 18 عیار(تومان)"
                                    control={control}
                                    errors={errors.gold18KPrice}
                                    name="gold18KPrice"
                                    isDark
                                    inputMode="numeric"
                                  />
                                )}
                              />
                            </div>
                            <div className="flex-1 w-full">
                              <Controller
                                name="gold24KPrice"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="قیمت طلای 24 عیار(تومان)"
                                    control={control}
                                    errors={errors.gold24KPrice}
                                    name="gold24KPrice"
                                    isDark
                                    inputMode="numeric"
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="w-1/2">
                              <span>زمانبندی بروز رسانی قیمت</span>
                              <div className="w-full pt-2">
                                <select
                                  className="w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  name=""
                                  id=""
                                >
                                  <option value="2">1 ساعت</option>
                                  <option value="2">2 ساعت</option>
                                  <option value="1">3 ساعت</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 h-full pt-6">
                              <Button type="submit" className="bg-[#009ef7] text-white">
                                بروز رسانی قیمت طلا
                              </Button>
                              <Button type="submit" className="bg-[#009ef7] text-white">
                                بروز رسانی قیمت محصولات
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-end justify-end mt-4">
                            <Button type="submit" className="">
                              ذخیره تغییرات
                            </Button>
                          </div>
                        </form>
                      </div>
                    </Tab.Panel>

                    <Tab.Panel></Tab.Panel>

                    <Tab.Panel>
                      <div>
                        <div className="flex flex-col xs:flex-row items-center justify-end gap-4">
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
                        <DataStateDisplay
                          {...featuresQueryProps}
                          refetch={refetch}
                          dataLength={(featureData && featureData?.data?.data?.length) || 0}
                          emptyComponent={<EmptyCustomList />}
                          loadingComponent={<TableSkeleton count={4} />}
                        >
                          <table className="w-[700px] md:w-full mx-auto mt-4">
                            <thead className="bg-sky-300">
                              <tr>
                                <th className="text-sm py-3 px-2 pr-0 text-gray-600 font-normal w-[150px] text-center">
                                  <div className="pr-2">نام</div>
                                </th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal w-1/4">محصولات مرتبط</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">وضعیت</th>
                                <th className="text-sm py-3 px-2 text-gray-600 font-normal">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {featureData?.data?.data &&
                                featureData?.data?.data.map((feature, index) => {
                                  return (
                                    <tr
                                      key={feature.id}
                                      className={`h-16 border-b ${index % 2 !== 0 ? '' : 'bg-gray-50'}`}
                                    >
                                      <td className="text-center">
                                        <div
                                          onClick={() => handlerEditFeatureModal(feature)}
                                          className={`text-sm text-sky-500 px-2`}
                                        >
                                          {feature.name}
                                        </div>
                                      </td>
                                      <td className="text-center text-sm text-gray-600">
                                        <div
                                          className="text-sky-500 cursor-pointer farsi-digits"
                                          onClick={() => handleChangePage(feature.id)}
                                        >
                                          {feature.count}
                                        </div>
                                      </td>
                                      <td className="text-center text-green-500">فعال</td>
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
                                                <button
                                                      onClick={() => handleDelete(feature)}
                                                      className="flex justify-start gap-x-2 px-3 py-2 hover:bg-gray-100 w-full"
                                                    >
                                                      <span>حذف</span>
                                                    </button>
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

export default dynamic(() => Promise.resolve(Jewelry), { ssr: false })
