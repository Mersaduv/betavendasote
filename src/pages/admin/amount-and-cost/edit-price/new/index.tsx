import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { ICategory, IEditPriceForm } from '@/types'
import { useGetCategoriesTreeQuery, useUpsertEditPriceMutation, useUpsertTicketMutation } from '@/services'
import { ProtectedRouteWrapper } from '@/components/user'
import { useAppSelector, useDisclosure } from '@/hooks'
import { useEffect, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { editPriceFormValidationSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui'
import { CategorySelectedCombobox } from '@/components/selectorCombobox'
import { ArrowSmUp } from 'heroicons-react'
import { FaArrowUp } from 'react-icons/fa'
function flattenCategories(categories: ICategory[]): ICategory[] {
  let flatList: ICategory[] = []

  categories.forEach((category) => {
    flatList.push(category)

    if (category.childCategories && category.childCategories.length > 0) {
      flatList = flatList.concat(flattenCategories(category.childCategories))
    }
  })

  return flatList
}
interface Props {}
const NewEditPrice: NextPage<Props> = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()
  const [userType, setUserType] = useState('')
  const [towards, setTowards] = useState('0')
  const [userRole, setUserRole] = useState('0')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [ticketType, setTicketType] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([])
  const [flatCategories, setFlatCategories] = useState<ICategory[]>([])
  const [isActive, setIsActive] = useState('true')
  const [productType, setProductType] = useState(0)
  const [actionType, setActionType] = useState(0)
  const [priceDisplay, setPriceDisplay] = useState('')
  // ? Queries
  const { data: categoryData } = useGetCategoriesTreeQuery()
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<IEditPriceForm>({
    resolver: yupResolver(editPriceFormValidationSchema) as unknown as Resolver<IEditPriceForm>,
  })
  // ? Create Edit Price
  const [createEditPrice, { isSuccess, isLoading, data, isError, error }] = useUpsertEditPriceMutation()
  // ? Handlers
  const onSuccess = () => {
    push(`/admin/amount-and-cost/edit-price`)
  }

  const createHandler: SubmitHandler<IEditPriceForm> = (data) => {
    createEditPrice({
      ...data,
      isActive: isActive === 'true',
      priceValue: Number(data.priceValue || 0),
      percentageValue: Number(data.percentageValue || 0),
    })
  }

  const formatNumber = (value: string) => {
    if (!value) return ''
    const numericValue = value.replace(/[^0-9]/g, '')
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '')
    const formattedValue = formatNumber(rawValue)
    setPriceDisplay(formattedValue)
    setValue('priceValue', rawValue ? Number(rawValue) : 0, { shouldValidate: true })
  }
  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsActive(event.target.value)
    setValue('isActive', event.target.value === 'true')
  }
  const handleCategorySelect = (selectedCategories: ICategory[]) => {
    setSelectedCategories(selectedCategories)
    setValue(
      'categoryIds',
      selectedCategories.map((category) => category.id)
    )
  }

  const handleChangeProductType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProductType(Number(event.target.value))
    setValue('productType', Number(event.target.value))
  }

  const handleChangeActionType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActionType(Number(event.target.value))
    setValue('action', Number(event.target.value))
  }

  useEffect(() => {
    if (categoryData) {
      const flatCategories = flattenCategories(categoryData?.data || [])
      setFlatCategories(flatCategories)
    }
  }, [categoryData])

  console.log(formErrors)
  return (
    <ProtectedRouteWrapper>
      <>
        {(isSuccess || isError) && (
          <HandleResponse
            isError={isError}
            isSuccess={isSuccess}
            error={error}
            message={data?.message}
            onSuccess={onSuccess}
          />
        )}

        <main>
          <Head>
            <title>ویرایش جمعی قیمت</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full h-screen">
              <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(createHandler)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">ویرایش جمعی قیمت</h3>

                      <div className="md:w-1/2 w-full px-4 flex flex-col mx-auto py-6 pb-10 space-y-4">
                        <div>
                          <label htmlFor="category" className="text-gray-600">
                            دسته‌بندی <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <CategorySelectedCombobox
                            categories={flatCategories}
                            onCategorySelect={handleCategorySelect}
                            stateCategoryData={selectedCategories}
                          />
                          {formErrors.categoryIds && (
                            <p className="text-red-500 text-sm">{formErrors.categoryIds.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="isActive" className="text-gray-600">
                            وضعیت <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <select
                            className={`w-full text-start text-sm h-[36px]  rounded-md border border-gray-200 text-gray-600`}
                            id="isActive"
                            value={isActive}
                            {...register('isActive', { onChange: handleChangeStatus })}
                          >
                            <option value="false" className="appearance-none">
                              غیر فعال
                            </option>
                            <option value="true" className="appearance-none">
                              فعال
                            </option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="productType" className="text-gray-600">
                            نوع محصول <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <select
                            className={`w-full text-start text-sm h-[36px]  rounded-md border border-gray-200 text-gray-600`}
                            id="productType"
                            value={productType}
                            {...register('productType', { onChange: handleChangeProductType })}
                          >
                            <option value={0} className="appearance-none">
                              انتخاب
                            </option>
                            <option value={1} className="appearance-none">
                              متغیر
                            </option>
                            <option value={2} className="appearance-none">
                              ساده
                            </option>
                          </select>
                          {formErrors.productType && (
                            <p className="text-red-500 text-sm">{formErrors.productType.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="action" className="text-gray-600">
                            عملیات <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <select
                            className={`w-full text-start text-sm h-[36px]  rounded-md border border-gray-200 text-gray-600`}
                            id="action"
                            value={actionType}
                            {...register('action', { onChange: handleChangeActionType })}
                          >
                            <option value={0} className="appearance-none">
                              انتخاب
                            </option>
                            <option value={1} className="appearance-none">
                              ↑ افزایش قیمت بر اساس درصد
                            </option>
                            <option value={2} className="appearance-none">
                              ↑ افزایش قیمت بر اساس مبلغ
                            </option>
                            <option value={3} className="appearance-none">
                              ↓ کاهش قیمت بر اساس درصد
                            </option>
                            <option value={4} className="appearance-none">
                              ↓ کاهش قیمت بر اساس مبلغ
                            </option>
                          </select>
                          {formErrors.action && <p className="text-red-500 text-sm">{formErrors.action.message}</p>}
                        </div>
                        {actionType > 0 && (
                          <div>
                            <label
                              htmlFor={`${actionType === 1 || actionType === 3 ? 'percentageValue' : 'priceValue'}`}
                              className="text-gray-600"
                            >
                              مقدار <span className="text-red-500 font-semibold">*</span>
                            </label>
                            <div className="flex items-center rounded-md border">
                              {actionType === 1 || actionType === 2 ? (
                                <div className="bg-[#f5f8fa] h-[36px] border-l w-[42px] flex-center text-red-600 rounded-r-md">
                                  <FaArrowUp className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="bg-[#f5f8fa] h-[36px] border-l w-[42px] flex-center text-green-600 rounded-r-md">
                                  <FaArrowUp className="w-3.5 h-3.5 rotate-180" />
                                </div>
                              )}
                              {actionType === 1 || actionType === 3 ? (
                                <>
                                  <input
                                    id="percentageValue"
                                    type="number"
                                    {...register('percentageValue')}
                                    className="w-full text-start text-sm h-[36px]  rounded-md rounded-r-none rounded-l-none border-none border-gray-200 text-gray-600 farsi-digits"
                                  />
                                </>
                              ) : actionType === 2 || actionType === 4 ? (
                                <>
                                  <input
                                    id="priceValue"
                                    type="text"
                                    value={priceDisplay}
                                    onChange={handlePriceChange}
                                    className="w-full text-start text-sm h-[36px]  rounded-md rounded-r-none rounded-l-none border-none border-gray-200 text-gray-600 farsi-digits"
                                  />
                                </>
                              ) : null}
                              <div className="h-[36px] border-r bg-[#f5f8fa] px-3 flex-center rounded-l-md">
                                <span>{actionType === 1 || actionType === 3 ? '%' : 'تومان'}</span>
                              </div>
                            </div>
                            {formErrors.percentageValue && (
                              <p className="text-red-500 text-sm">{formErrors.percentageValue.message}</p>
                            )}
                            {formErrors.priceValue && (
                              <p className="text-red-500 text-sm">{formErrors.priceValue.message}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end w-full">
                  {/* <div className="flex flex-col">
                              <p className={`text-red-500 h-5 px-10  visible`}>
                                {formErrors.title
                                  ? formErrors.title.message
                                  : titleWatch !== ''
                                  ? ''
                                  : 'وارد کردن نام مقاله الزامی است'}
                              </p>
                
                              <p className={`text-red-500 h-5 px-10 visible `}>
                                {formErrors.thumbnail ? formErrors.thumbnail.message : thumbnailWatch ? '' : 'تصویر نمایه الزامی است'}
                              </p>
                            </div> */}
                  <div className=" w-fit">
                    {' '}
                    <Button
                      isLoading={isLoading}
                      type="submit"
                      className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
                    >
                      اعمال
                    </Button>
                  </div>
                </div>
              </form>
            </section>
          </DashboardLayout>
        </main>
      </>
    </ProtectedRouteWrapper>
  )
}

export default dynamic(() => Promise.resolve(NewEditPrice), { ssr: false })
