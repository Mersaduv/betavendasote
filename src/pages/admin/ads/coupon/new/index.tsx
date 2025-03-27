import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { ICategory, ICouponForm, IEditPriceForm } from '@/types'
import { useGetCategoriesTreeQuery, useUpsertEditPriceMutation, useUpsertTicketMutation } from '@/services'
import { ProtectedRouteWrapper } from '@/components/user'
import { useAppSelector, useDisclosure } from '@/hooks'
import { useEffect, useState } from 'react'
import { Controller, Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { couponFormValidationSchema, editPriceFormValidationSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, DisplayError, TextField } from '@/components/ui'
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
const NewCoupon: NextPage<Props> = () => {
  // ? Assets
  const { push } = useRouter()
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
    setValue,
    control,
    formState: { errors: formErrors, isValid },
  } = useForm<ICouponForm>({
    resolver: yupResolver(couponFormValidationSchema) as unknown as Resolver<ICouponForm>,
  })
  // ? Create Edit Price
  //   const [createEditPrice, { isSuccess, isLoading, data, isError, error }] = useUpsertEditPriceMutation()
  // ? Handlers
  const onSuccess = () => {
    push(`/admin/ads/coupon`)
  }

  const createHandler: SubmitHandler<ICouponForm> = (data) => {
    console.log(data)
  }

  console.log(formErrors)
  return (
    <ProtectedRouteWrapper>
      <>
        <main>
          <Head>
            <title>افزودن کوپن</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full h-screen">
              <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(createHandler)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">افزودن کوپن</h3>

                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 mx-auto py-6 pb-2 px-4 gap-x-4 ">
                        <Controller
                          name="couponCode"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.couponCode}
                              label="کد کوپن"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <Controller
                          name="limit"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.limit}
                              label="محدودیت"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.startDate}
                              label="تاریخ شروع"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.endDate}
                              label="تاریخ انقضا"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <div className="sm:col-span-2">
                          <label
                            className="block text-sm font-normal mb-2 text-gray-700 md:min-w-max lg:text-sm"
                            htmlFor="description"
                          >
                            توضیحات <span className="text-red-500 font-semibold">*</span>
                          </label>
                          <textarea
                            placeholder=""
                            className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                            id="description"
                            {...register('description')}
                          />
                          <div className="w-fit" dir={'ltr'}>
                            {' '}
                            <DisplayError errors={formErrors.description} />
                          </div>
                        </div>
                      </div>

                      <hr className="mx-4" />

                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 mx-auto py-6 pb-2 px-4 gap-x-4 ">
                        <Controller
                          name="discountRate"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.discountRate}
                              label="نرخ تخفیف"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <Controller
                          name="minOrderAmount"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.minOrderAmount}
                              label="حداقل مبلغ سفارش"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />

                        <Controller
                          name="maxDiscountAmount"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.maxDiscountAmount}
                              label="حداکثر مبلغ تخفیف"
                              placeholder=""
                              isDark
                              isUserForm
                              isRequireStar
                            />
                          )}
                        />
                      </div>

                      <hr className="mx-4" />

                      <div className="w-full grid mx-auto py-6  px-4 gap-x-4 ">
                        <div>
                          <label className="text-gray-600">نوع تخفیف</label>
                          <div className="flex flex-col space-y-2 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="all"
                                className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0  focus:ring-sky-500"
                                {...register('discountType')}
                              />
                              <span className="ml-2">تخفیف برای همه اعمال شود</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="specific"
                                className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0  focus:ring-sky-500"
                                {...register('discountType')}
                              />
                              <span className="ml-2">تخفیف فقط برای برخی محصول ها اعمال شود</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="exclude"
                                className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0  focus:ring-sky-500"
                                {...register('discountType')}
                              />
                              <span className="ml-2">تخفیف برای همه محصول ها به استثنا چند محصول اعمال شود</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <hr className="mx-4" />

                      <div className="w-full grid mx-auto py-6 px-4 gap-x-4 ">
                        <div className="flex flex-col w-full gap-2">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0 focus:ring-sky-500 text-xl rounded-md cursor-pointer"
                              {...register('isPublic')}
                            />
                            <span className="ml-2">
                              کوپن عمومی باشد و به صورت خودکار، بر روی همه سفارش ها اعمال شود
                            </span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0 focus:ring-sky-500 text-xl rounded-md cursor-pointer"
                              {...register('isFreeShipping')}
                            />
                            <span className="ml-2">هزینه ارسال رایگان محاسبه شود</span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0 focus:ring-sky-500 text-xl rounded-md cursor-pointer"
                              {...register('isActive')}
                            />
                            <span className="ml-2">کوپن فعال باشد</span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0 focus:ring-sky-500 text-xl rounded-md cursor-pointer"
                              {...register('excludeDiscountedProducts')}
                            />
                            <span className="ml-2">
                              اگر میخواهد کد تخفیف روی محصولات تخفیف خورده کار نکند چک باکس را فعال نمایید
                            </span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 border-none bg-gray-100 checked:bg-sky-500 ring-0 focus:ring-sky-500 text-xl rounded-md cursor-pointer"
                              {...register('notUsableWithOtherCoupons')}
                            />
                            <span className="ml-2">
                              اگر کوپن مجاز به استفاده با کوپن های دیگر نیست چکباکس را فعال نمایید
                            </span>
                          </label>
                        </div>
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
                      type="submit"
                      className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
                    >
                      افزودن
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

export default dynamic(() => Promise.resolve(NewCoupon), { ssr: false })
