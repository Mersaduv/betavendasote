import { ChangeEvent, Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react'

import { SubmitHandler, useForm, Resolver, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FaArrowDownLong } from 'react-icons/fa6'
import { Button, CloseIconButton, Combobox, DisplayError, Modal, TextField } from '@/components/ui'
import dynamic from 'next/dynamic'
import { IArticle, IArticleForm, ICategory, IColumnFooter, IUser, IUserForm } from '@/types'
import { articleFormValidationSchema, userFormValidationSchema } from '@/utils'
import {
  useDeleteTrashArticleMutation,
  useGetAllCategoriesQuery,
  useGetCategoriesTreeQuery,
  useGetColumnFootersQuery,
  useGetRolesQuery,
} from '@/services'
import { useAppDispatch, useAppSelector, useDisclosure } from '@/hooks'
import { setStateStringSlice, showAlert } from '@/store'
import jalaali from 'jalaali-js'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { PiUserDuotone } from 'react-icons/pi'
import { HandleResponse } from '../shared'
import { ConfirmDeleteModal } from '../modals'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { Dialog, Transition } from '@headlessui/react'
const iranCity = require('iran-city')

const fetchImageAsFile = async (url: string): Promise<File> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    const fileName = url.split('/').pop()
    return new File([blob], fileName || 'image.jpg', { type: blob.type })
  } catch (error) {
    console.error(`Failed to fetch image from ${url}:`, error)
    throw error
  }
}
interface CreateUserFormProps {
  mode: 'create' | 'edit'
  createHandler: (data: FormData) => void
  updateHandler?: never
  selectedUser?: never
  isLoadingCreate: boolean
  isLoadingUpdate?: never
}

interface EditUserFormProps {
  mode: 'edit'
  createHandler?: never
  updateHandler: (data: FormData) => void
  selectedUser: IUser
  isLoadingCreate?: never
  isLoadingUpdate: boolean
}
const toJalaali = (date: Date) => {
  const jalaaliDate = jalaali.toJalaali(date)
  return {
    day: jalaaliDate.jd,
    month: jalaaliDate.jm,
    year: jalaaliDate.jy,
  }
}
const days = Array.from({ length: 31 }, (_, i) => digitsEnToFa(String(i + 1)))
const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const currentDateJalaali = toJalaali(new Date())
const currentYearJalaali = currentDateJalaali.year
const years = Array.from({ length: 100 }, (_, i) => digitsEnToFa(String(currentYearJalaali - i)))
type Props = CreateUserFormProps | EditUserFormProps
const ArticleForm: React.FC<Props> = (props) => {
  // ? Props
  const { mode, createHandler, isLoadingCreate, isLoadingUpdate, updateHandler, selectedUser } = props
  // assets
  const dispatch = useAppDispatch()
  const { query, back, push } = useRouter()
  const AllProvinces = iranCity.allProvinces()
  // ? States
  const [selectedUserFile, setSelectedUserFiles] = useState<any[]>([])
  const [selectedUserIdFile, setSelectedUserIdFiles] = useState<any[]>([])
  const [isActive, setIsActive] = useState('true')
  const [userType, setUserType] = useState('0')
  const [commissionType, setCommissionType] = useState('0')
  const [userRole, setUserRole] = useState('0')
  const [cities, setCities] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  // ? Queries
  const { data: roleData } = useGetRolesQuery({ pageSize: 100 })

  // ? Form Hook
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<IUserForm>({
    resolver: yupResolver(userFormValidationSchema) as unknown as Resolver<IUserForm>,
  })

  // ? Handlers

  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    const birthDate = watch('birthDate') || ''
    const [year, month, day] = birthDate.split('/')
    const newBirthDate = {
      day: field === 'day' ? value : day,
      month: field === 'month' ? value : month,
      year: field === 'year' ? value : year,
    }
    setValue('birthDate', `${newBirthDate.year}/${newBirthDate.month}/${newBirthDate.day}`)
  }
  const handleModalOpen = () => setIsModalOpen(true)
  const handleModalClose = () => setIsModalOpen(false)

  const editedCreateHandler: SubmitHandler<IUserForm> = (data) => {
    console.log(data, 'datadatadata')
    const formData = new FormData()

    // formData.append('Title', data.title)
    formData.append('IsActive', isActive.toString())
    formData.append('UserType', userType)
    if (data.roleIds) {
      data.roleIds.forEach((id) => {
        formData.append('RoleIds', id)
      })
    }
    if (data.thumbnail) {
      formData.append('Thumbnail', data.thumbnail)
    }
    if (data.idCardThumbnail) {
      formData.append('IdCardThumbnail', data.idCardThumbnail)
    }
    formData.append('MobileNumber', data.mobileNumber)
    formData.append('PassCode', data.passCode)
    formData.append('FirstName', data.firstName)
    formData.append('FamilyName', data.familyName)
    if (data.fatherName) formData.append('FatherName', data.fatherName)
    if (data.telePhone) formData.append('TelePhone', data.telePhone)
    if (data.province) {
      if (data.province.id) formData.append('Province.Id', data.province.id.toString())
      if (data.province.name) formData.append('Province.Name', data.province.name)
      if (data.province.slug) formData.append('Province.Slug', data.province.slug)
    }
    if (data.city) {
      if (data.city.id) formData.append('City.Id', data.city.id.toString())
      if (data.city.name) formData.append('City.Name', data.province.name)
      if (data.city.slug) formData.append('City.Slug', data.city.slug)
      if (data.city.province_id) formData.append('City.Slug', data.city.province_id.toString())
    }
    if (data.postalCode) formData.append('PostalCode', data.postalCode)
    if (data.firstAddress) formData.append('firstAddress', data.firstAddress)
    if (data.birthDate) formData.append('BirthDate', data.birthDate)
    if (data.idNumber) formData.append('IdNumber', data.idNumber)
    if (data.nationalCode) formData.append('NationalCode', data.nationalCode)
    if (data.bankAccountNumber) formData.append('BankAccountNumber', data.bankAccountNumber)
    if (data.shabaNumber) formData.append('ShabaNumber', data.shabaNumber)
    if (data.note) formData.append('Note', data.note)

    // Supplier fields
    if (data.storeName) formData.append('StoreName', data.storeName)
    if (data.storeTelephone) formData.append('StoreTelephone', data.storeTelephone)
    if (data.storeAddress) formData.append('StoreAddress', data.storeAddress)
    if (data.bussinessLicenseNumber) formData.append('BussinessLicenseNumber', data.bussinessLicenseNumber)
    if (data.isActiveAddProduct) formData.append('isActiveAddProduct', data.isActiveAddProduct.toString())
    if (data.isPublishProduct) formData.append('isPublishProduct', data.isPublishProduct.toString())
    if (data.isSelectedAsSpecialSeller)
      formData.append('isSelectedAsSpecialSeller', data.isSelectedAsSpecialSeller.toString())
    if (data.commissionType) formData.append('CommissionType', data.commissionType.toString())
    if (data.percentageValue) formData.append('PercentageValue', data.percentageValue)
    if (data.sellerPerformance) formData.append('SellerPerformance', data.sellerPerformance)
    if (data.timelySupply) formData.append('TimelySupply', data.timelySupply)
    if (data.shippingCommitment) formData.append('ShippingCommitment', data.shippingCommitment)
    if (data.noReturns) formData.append('NoReturns', data.noReturns)

    if (mode === 'edit' && selectedUser !== undefined) {
      formData.append('Id', selectedUser.id)
      console.log(data, '==========data')
      updateHandler(formData)
    } else {
      createHandler(formData)
    }
  }

  const handleUserFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 40 * 1024 // 40 KB
      const exactWidth = 600
      const exactHeight = 600

      Array.from(files).forEach((file) => {
        if (file.type !== 'image/jpeg') {
          dispatch(
            showAlert({
              status: 'error',
              title: 'فرمت عکس ها می بایست jpg باشد',
            })
          )
          return
        }

        // if (file.size > maxFileSize) {
        //   dispatch(
        //     showAlert({
        //       status: 'error',
        //       title: 'حجم عکس ها می بایست حداکثر 40 کیلوبایت باشد',
        //     })
        //   )
        //   return
        // }

        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          // if (img.width !== exactWidth || img.height !== exactHeight) {
          //   dispatch(
          //     showAlert({
          //       status: 'error',
          //       title: 'سایز عکس ها می بایست 600*600 پیکسل باشد',
          //     })
          //   )
          // } else {
          validFiles.push(file)
          setValue('thumbnail', file, { shouldValidate: true })
          setSelectedUserFiles([...validFiles])
          // }
        }
      })
    }
  }

  const handleUserIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []
      const maxFileSize = 40 * 1024 // 40 KB
      const exactWidth = 600
      const exactHeight = 400

      Array.from(files).forEach((file) => {
        if (file.type !== 'image/jpeg') {
          dispatch(
            showAlert({
              status: 'error',
              title: 'فرمت عکس ها می بایست jpg باشد',
            })
          )
          return
        }

        // if (file.size > maxFileSize) {
        //   dispatch(
        //     showAlert({
        //       status: 'error',
        //       title: 'حجم عکس ها می بایست حداکثر 40 کیلوبایت باشد',
        //     })
        //   )
        //   return
        // }

        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          // if (img.width !== exactWidth || img.height !== exactHeight) {
          //   dispatch(
          //     showAlert({
          //       status: 'error',
          //       title: 'سایز عکس ها می بایست 400*600 پیکسل باشد',
          //     })
          //   )
          // } else {
          validFiles.push(file)
          setValue('idCardThumbnail', file, { shouldValidate: true })
          setSelectedUserIdFiles([...validFiles])
          // }
        }
      })
    }
  }

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsActive(event.target.value)
  }

  const handleChangeUserType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(event.target.value)
  }

  const handleChangeCommissionType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCommissionType(event.target.value)
  }

  const handleChangeUserRole = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleId = event.target.value
    setUserRole(selectedRoleId) // به‌روزرسانی حالت محلی
    setValue('roleIds', [selectedRoleId]) // تنظیم مقدار roleIds به عنوان یک آرایه
  }

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'province') {
        setCities(iranCity.citiesOfProvince(value.province?.id))
        setValue('city', {} as IUserForm['city'])
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  if (formErrors) {
    console.log(formErrors, 'formErrors')
  }
  return (
    <>
      <section>
        <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(editedCreateHandler)}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-1">
              <div className="bg-white w-full rounded-md shadow-item">
                <h3 className="border-b p-6 text-gray-600 flex gap-2">
                  {mode === 'edit' ? 'ویرایش کاربر' : 'کاربر جدید'}{' '}
                  {/* <div className="text-sky-500">{selectedUser?.fullName}</div> */}
                </h3>
                <div className="flex flex-col">
                  {/* title  */}
                  <div className="flex px-10 py-6 flex-col xs:flex-row">
                    <label
                      htmlFor="userType"
                      className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">عنوان</span>
                    </label>
                    <select
                      className={`w-full text-center rounded-md rounded-r-none border border-gray-300`}
                      id="userType"
                      value={userType}
                      {...register('userType', { onChange: handleChangeUserType })}
                    >
                      <option value="0">انتخاب کنید</option>
                      <option value="1">پرسنل</option>
                      <option value="2">فروشنده</option>
                    </select>
                  </div>

                  {userType === '1' && (
                    <div className="flex px-10 py-0 flex-col xs:flex-row">
                      <label
                        htmlFor="userRole"
                        className="flex items-center xs:py-0 py-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                      >
                        <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" />
                        <span className="whitespace-nowrap text-center w-[113px]">سمت</span>
                      </label>
                      <select
                        className={`w-full text-center rounded-md rounded-r-none border border-gray-300`}
                        id="userRole"
                        value={userRole}
                        onChange={handleChangeUserRole} 
                      >
                        <option value="0">انتخاب کنید</option>
                        {roleData?.data?.data?.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex px-10 py-10 pt-6 flex-col xs:flex-row">
                    <label
                      htmlFor="isActive"
                      className="flex gap-1 items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                    >
                      <img className="w-5 h-5" src="/assets/svgs/duotone/eye.svg" alt="" />
                      <span className="whitespace-nowrap text-center w-[113px]">وضعیت فعالیت </span>
                    </label>
                    <select
                      className={`w-full text-center rounded-md rounded-r-none border border-gray-300 ${
                        isActive === 'true' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                      id="isActive"
                      value={isActive}
                      {...register('isActive', { onChange: handleChangeStatus })}
                    >
                      <option value="false" className={isActive !== 'false' ? 'bg-white' : ''}>
                        غیر فعال
                      </option>
                      <option value="true" className={isActive !== 'true' ? 'bg-white' : ''}>
                        فعال
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* image  */}
            <div className="flex flex-1 relative">
              <div className="bg-white  flex-col w-full h-full rounded-md shadow-item">
                <h3 className="border-b p-6 text-gray-600">تصویر</h3>
                {/* negare  */}
                <div className="flex justify-center gap-4 mt-8">
                  <div className="">
                    <input
                      type="file"
                      className="hidden"
                      id="thumbnail"
                      onChange={handleUserFileChange}
                      accept="image/jpeg"
                    />
                    <label htmlFor="thumbnail" className="block cursor-pointer p-6 text-sm font-normal">
                      <h3 className="font-bold text-center mb-6">عکس پرسنلی</h3>
                      {selectedUserFile.length > 0 ? (
                        selectedUserFile.map((file: any, index: number) => (
                          <div key={index} className="text-sm shadow-item rounded-lg p-2 text-gray-600">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-[125px] h-[125px] object-contain  rounded-md"
                            />
                          </div>
                        ))
                      ) : (
                        <img
                          className="w-[125px] h-[125px] rounded-md"
                          src="/images/other/product-placeholder.png"
                          alt="product-placeholder"
                        />
                      )}
                    </label>
                  </div>

                  <div className="">
                    <input
                      type="file"
                      className="hidden"
                      id="idThumbnail"
                      onChange={handleUserIdFileChange}
                      accept="image/jpeg"
                    />
                    <label htmlFor="idThumbnail" className="block cursor-pointer p-6 text-sm font-normal">
                      <h3 className="font-bold text-center mb-6">کارت ملی</h3>
                      {selectedUserIdFile.length > 0 ? (
                        selectedUserIdFile.map((file: any, index: number) => (
                          <div key={index} className="text-sm shadow-item rounded-lg p-2 text-gray-600">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-[125px] h-[125px] object-contain  rounded-md"
                            />
                          </div>
                        ))
                      ) : (
                        <img
                          className="w-[125px] h-[125px] rounded-md"
                          src="/images/other/product-placeholder.png"
                          alt="product-placeholder"
                        />
                      )}
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2">
                  <span className="font-normal text-[11px] pt-2">سایز عکس پرسنلی میبایست 600*600 باشد </span>
                  <span className="font-normal text-[11px]">سایز عکس کارت ملی میبایست 400*600 باشد </span>
                  <span className="font-normal text-[11px]">فرمت تصویر میبایست jpg باشد </span>
                  <span className="font-normal text-[11px]">حجم عکس میبایست حداکثر 40 کیلوبایت باشد </span>
                </div>
              </div>
            </div>
          </div>

          {/*is show  add product descriptions*/}
          <div className="flex flex-col flex-1">
            <div className="bg-white w-full rounded-md shadow-item">
              <h3 className="border-b p-6 text-gray-600">مشخصات کاربر</h3>
              <div className="grid md:grid-cols-2 w-full gap-x-4 px-4 mt-6">
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="شماره موبایل(نام کاربری)"
                      control={control}
                      errors={formErrors.mobileNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      isRequire
                    />
                  )}
                />

                <Controller
                  name="passCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="رمز ورود"
                      control={control}
                      errors={formErrors.passCode}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      isCenter
                      isRequire
                    />
                  )}
                />

                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      control={control}
                      errors={formErrors.firstName}
                      label="نام"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      isRequire
                    />
                  )}
                />

                <Controller
                  name="familyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      control={control}
                      errors={formErrors.familyName}
                      label="نام خانوادگی"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      isRequire
                    />
                  )}
                />

                <Controller
                  name="fatherName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      control={control}
                      errors={formErrors.fatherName}
                      label="نام پدر"
                      classStyle={`bg-white rounded-md`}
                      type="text"
                      isUserForm
                    />
                  )}
                />

                <Controller
                  name="telePhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="تلفن ثابت"
                      control={control}
                      errors={formErrors.telePhone}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                    />
                  )}
                />

                <div className="space-y-1 mb-[18px]">
                  <label htmlFor="">استان</label>
                  <Combobox
                    control={control}
                    name="province"
                    list={AllProvinces}
                    placeholder="لطفا استان خود را انتخاب کنید"
                  />
                  <DisplayError errors={formErrors.province?.name} />
                </div>

                <div className="space-y-1 mb-[18px]">
                  <label htmlFor="">شهر</label>
                  <Combobox control={control} name="city" list={cities} placeholder="لطفا شهرستان خود را انتخاب کنید" />
                  <DisplayError errors={formErrors.city?.name} />
                </div>

                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="کد پستی"
                      control={control}
                      errors={formErrors.postalCode}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                    />
                  )}
                />
                <Controller
                  name="firstAddress"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      control={control}
                      errors={formErrors.firstAddress}
                      label="آدرس منزل"
                      classStyle={`bg-white rounded-md`}
                      type="text"
                      isUserForm
                    />
                  )}
                />
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <div className=" w-full">
                        <TextField
                          {...field}
                          value={field.value}
                          control={control}
                          errors={formErrors.birthDate}
                          label="تاریخ تولد"
                          readOnly
                          isBirthDay
                          isUserForm
                        />
                      </div>
                      <div
                        onClick={handleModalOpen}
                        className="bg-[#e90089] flex justify-center gap-3 hover:bg-[#e90088c0] text-center cursor-pointer border-[#e90089] rounded-l-md border text-sm text-white h-[38.5px] lg:h-[42px] items-center w-full"
                      >
                        <FaRegCalendarAlt className="w-5 h-5 text-white" />
                        انتخاب تاریخ تولد
                      </div>
                      <Transition appear show={isModalOpen} as={Fragment}>
                        <Dialog as="div" className="relative z-300" onClose={handleModalClose}>
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-black/25" />
                          </Transition.Child>

                          <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                              >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                                  <Dialog.Title
                                    as="h3"
                                    className="text-lg p-4 font-medium leading-6 text-gray-900 flex items-center justify-between -mt-1.5"
                                  >
                                    انتخاب تاریخ تولد
                                    <CloseIconButton className="-ml-2" onClick={handleModalClose} />
                                  </Dialog.Title>
                                  <hr className="" />
                                  <div className="select-container flex gap-2 pt-4 px-4 w-full">
                                    <select
                                      className="w-full border-none"
                                      onChange={(e) => handleDateChange('day', e.target.value)}
                                      value={digitsEnToFa(field.value?.split('/')[2] || '')}
                                    >
                                      <option value="">روز</option>
                                      {days.map((day) => (
                                        <option key={day} value={day}>
                                          {day}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      className="w-full border-none"
                                      onChange={(e) => handleDateChange('month', e.target.value)}
                                      value={digitsEnToFa(field.value?.split('/')[1] || '')}
                                    >
                                      <option value="">ماه</option>
                                      {months.map((month, index) => (
                                        <option key={index + 1} value={digitsEnToFa(String(index + 1))}>
                                          {month}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      className="w-full border-none"
                                      onChange={(e) => handleDateChange('year', e.target.value)}
                                      value={digitsEnToFa(field.value?.split('/')[0] || '')}
                                    >
                                      <option value="">سال</option>
                                      {years.map((year) => (
                                        <option key={year} value={digitsEnToFa(year)}>
                                          {year}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="p-3.5">
                                    <button
                                      type="button"
                                      className="inline-flex justify-center w-full rounded-md border border-transparent bg-[#e90089] px-4 py-2 text-sm font-medium text-white hover:bg-[#f844aa] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                      onClick={handleModalClose}
                                    >
                                      ثبت
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition>
                    </div>
                  )}
                />

                <Controller
                  name="idNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="شماره شناسنامه"
                      control={control}
                      errors={formErrors.idNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                    />
                  )}
                />

                <Controller
                  name="nationalCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="کد ملی"
                      control={control}
                      errors={formErrors.nationalCode}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                    />
                  )}
                />

                <Controller
                  name="bankAccountNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="شماره کارت بانکی"
                      control={control}
                      errors={formErrors.bankAccountNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                    />
                  )}
                />

                <Controller
                  name="shabaNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="number"
                      {...field}
                      label="شماره کارت بانکی"
                      control={control}
                      errors={formErrors.shabaNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      classStyle={`bg-white rounded-md`}
                      isUserForm
                      isSheba
                    />
                  )}
                />
              </div>
              <div className=" px-4 pb-4">
                <label className="block mb-1.5 text-gray-700 md:min-w-max lg:text-sm" htmlFor="note">
                  یادداشت
                </label>
                <textarea
                  placeholder="...."
                  className="input h-24 resize-none border-[#E3E3E7] rounded-[8px] bg-white placeholder:text-xs pr-2"
                  id="note"
                  {...register('note')}
                />
              </div>
            </div>
            {userType === '2' && (
              <>
                <div className="bg-white w-full rounded-md shadow-item mt-4">
                  <h3 className="border-b p-6 text-gray-600">مشخصات فروشگاه </h3>
                  <div className="grid md:grid-cols-2 w-full gap-x-4 px-4 mt-6">
                    <Controller
                      name="storeName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          control={control}
                          errors={formErrors.storeName}
                          label="نام فروشگاه"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="storeTelephone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          {...field}
                          label="تلفن فروشگاه"
                          control={control}
                          errors={formErrors.storeTelephone}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="storeAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          control={control}
                          errors={formErrors.storeAddress}
                          label="آدرس فروشگاه"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="bussinessLicenseNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          {...field}
                          label="شماره جواز کسب"
                          control={control}
                          errors={formErrors.bussinessLicenseNumber}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="bg-white w-full rounded-md shadow-item mt-4">
                  <h3 className="border-b p-6 text-gray-600">تنظیمات</h3>
                  <div className="flex mt-7">
                    <div className="flex items-center justify-center gap-4 w-full">
                      <Controller
                        name="isActiveAddProduct"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={onChange}
                              id="isActiveAddProduct"
                              className="w-[22.75px] cursor-pointer h-[22.75px] text-2xl text-[#e90089] bg-gray-100 border-gray-300 rounded focus:ring-white"
                            />
                            <label
                              htmlFor="isActiveAddProduct"
                              className="mr-2 cursor-pointer text-sm font-medium text-gray-700"
                            >
                              فعال‌سازی افزودن محصولات
                            </label>
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-4 w-full">
                      <Controller
                        name="isPublishProduct"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={onChange}
                              id="isPublishProduct"
                              className="w-[22.75px] cursor-pointer h-[22.75px] text-2xl text-[#e90089] bg-gray-100 border-gray-300 rounded focus:ring-white"
                            />
                            <label
                              htmlFor="isPublishProduct"
                              className="mr-2 cursor-pointer text-sm font-medium text-gray-700"
                            >
                              انتشار محصول به صورت مستقیم
                            </label>
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-4 w-full">
                      <Controller
                        name="isSelectedAsSpecialSeller"
                        control={control}
                        defaultValue={false}
                        render={({ field: { onChange, value } }) => (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={onChange}
                              id="isSelectedAsSpecialSeller"
                              className="w-[22.75px] cursor-pointer h-[22.75px] text-2xl text-[#e90089] bg-gray-100 border-gray-300 rounded focus:ring-white"
                            />
                            <label
                              htmlFor="isSelectedAsSpecialSeller"
                              className="mr-2 cursor-pointer text-sm font-medium text-gray-700"
                            >
                              انتخاب به عنوان فروشنده ویژه
                            </label>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 w-full gap-x-4 px-4 mt-6">
                    <div className="flex flex-col h-fit w-full">
                      <label className="mb-1.5" htmlFor="">
                        کمیسیون وندامد
                      </label>
                      <div className="flex w-full">
                        <select
                          className={`text-start w-[150px] rounded-md h-[42px] rounded-l-none border border-gray-300`}
                          id="userType"
                          value={commissionType}
                          {...register('commissionType', { onChange: handleChangeCommissionType })}
                        >
                          <option value="0">ثابت</option>
                          <option value="1">درصدی</option>
                        </select>
                        <Controller
                          name="percentageValue"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              control={control}
                              errors={formErrors.percentageValue}
                              // label="کمیسیون وندامد"
                              classStyle={`bg-white rounded-md rounded-r-none`}
                              disabled={commissionType === '0' ? true : false}
                              isUserForm
                              isPercentageValue
                            />
                          )}
                        />
                      </div>
                    </div>

                    <Controller
                      name="sellerPerformance"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          control={control}
                          errors={formErrors.sellerPerformance}
                          label="عملکرد فروشنده"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="timelySupply"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          {...field}
                          label="تامین به موقع"
                          control={control}
                          errors={formErrors.timelySupply}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="shippingCommitment"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          control={control}
                          errors={formErrors.shippingCommitment}
                          label="تعهد ارسال"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                    <Controller
                      name="noReturns"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="number"
                          {...field}
                          label="بدون مرجوعی"
                          control={control}
                          errors={formErrors.noReturns}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          classStyle={`bg-white rounded-md`}
                          isUserForm
                        />
                      )}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end w-full">
            <div className=" w-fit">
              {' '}
              <Button
                isLoading={isLoadingCreate || isLoadingUpdate}
                type="submit"
                className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
              >
                {mode === 'edit' ? 'بروزرسانی' : 'افزودن'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </>
  )
}

export default ArticleForm
