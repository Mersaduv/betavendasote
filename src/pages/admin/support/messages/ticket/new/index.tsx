import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse } from '@/components/shared'
import { IProductForm, ITicketAdminForm } from '@/types'
import {
  useCreateProductMutation,
  useGetRolesQuery,
  useGetTicketTypesQuery,
  useUpsertArticleMutation,
  useUpsertTicketMutation,
} from '@/services'
import { ArticleForm, ProductForm } from '@/components/form'
import { useDispatch } from 'react-redux'
import { setUpdated } from '@/store'
import { ProtectedRouteWrapper } from '@/components/user'
import { useAppSelector, useDisclosure } from '@/hooks'
import { useState } from 'react'
import { Controller, Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { ticketAdminFormValidationSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, DisplayError, TextField } from '@/components/ui'
import { MdClose } from 'react-icons/md'
import { FaUserPen, FaUsers } from 'react-icons/fa6'
import { HiUsers } from 'react-icons/hi'
import { FaUserTie } from 'react-icons/fa'

interface Props {}
const NewTicket: NextPage<Props> = () => {
  // ? Assets
  const { query, push } = useRouter()
  const { generalSetting } = useAppSelector((state) => state.design)
  const [isShowTicketModal, ticketModalHandlers] = useDisclosure()
  const [userType, setUserType] = useState('')
  const [towards, setTowards] = useState('0')
  const [userRole, setUserRole] = useState('0')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [ticketType, setTicketType] = useState('')
  // ? Queries
  const { data: ticketTypeData } = useGetTicketTypesQuery({ page: 1, pageSize: 99 })
  const { data: roleData } = useGetRolesQuery({ pageSize: 100 })
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<ITicketAdminForm>({
    resolver: yupResolver(ticketAdminFormValidationSchema) as unknown as Resolver<ITicketAdminForm>,
  })
  // ? Create
  // ? Create Ticket
  const [createTicket, { isSuccess, isLoading, data, isError, error }] = useUpsertTicketMutation()
  // ? Handlers
  const onSuccess = () => {
    push(`/admin/support/messages/ticket`)
  }

  const handleUserTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserType = event.target.value
    setValue('userType', selectedUserType)
    setUserType(selectedUserType)
  }

  const handleTowardsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTowards = event.target.value
    setTowards(selectedTowards)
  }

  const handleChangeUserRole = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleId = event.target.value
    setUserRole(selectedRoleId)
    setValue('roleId', selectedRoleId)
  }

  const createHandler: SubmitHandler<ITicketAdminForm> = (data) => {
    const formData = new FormData()
    formData.append('UserType', data.userType)
    if (data.userCode) formData.append('userCode', data.userCode)
    if (data.roleId) formData.append('RoleId', data.roleId)
    formData.append('TicketTypeId', data.ticketTypeId)
    formData.append('Message', data.message)
    formData.append('Subject', data.subject)
    formData.append('IsRecipient', JSON.stringify(true))
    if (data.thumbnail && data.thumbnail.length > 0) {
      Array.from(data.thumbnail).forEach((file) => {
        formData.append('Thumbnail', file)
      })
    }
    createTicket(formData)
  }

  const handleChangeUserType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTicketType(event.target.value)
  }

  const handleDelete = (index: number) => {
    setSelectedFiles((prevFiles) => {
      const updatedFiles = [...prevFiles]
      updatedFiles.splice(index, 1)
      return updatedFiles
    })

    setValue(
      'thumbnail',
      ((getValues('thumbnail') as File[]) || []).filter((_, i) => i !== index)
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const validFiles: any[] = []

      Array.from(files).forEach((file) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(img.src)

          validFiles.push(file)
          if (validFiles.length === Array.from(files).length) {
            setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles])
            if (validFiles.length > 0) {
              setValue('thumbnail', ((getValues('thumbnail') as File[]) || []).concat(validFiles))
            } else {
              setValue('thumbnail', [])
            }
          }
        }
      })
    }
  }
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
            <title>تیکت جدید</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full">
              <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(createHandler)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">تیکت جدید</h3>

                      <div className="flex flex-col">
                        <div>
                          <div className="flex px-10 py-6 pt-6 flex-col xs:flex-row">
                            <label
                              htmlFor="userType"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <FaUsers className='w-5 h-5' />
                              <span className="whitespace-nowrap text-center w-[113px]">ارسال به</span>
                            </label>
                            <select
                              className="w-full text-center rounded-md rounded-r-none border border-gray-300"
                              id="userType"
                              value={userType}
                              {...register('userType', { onChange: handleUserTypeChange })}
                              // value={userType || ''}
                              // onChange={handleUserTypeChange}
                            >
                              <option className="appearance-none text-sm" value="">
                                انتخاب کنید
                              </option>
                              <option value={'0'}>مشتری</option>
                              <option value={'1'}>پرسنل</option>
                              <option value={'2'}>فروشنده</option>
                            </select>
                          </div>
                        </div>

                        {userType !== '' && (
                          <div className="flex px-10 py-0 flex-col xs:flex-row">
                            <label
                              htmlFor="towards"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <HiUsers className='w-5 h-5' />
                              <span className="whitespace-nowrap text-center w-[113px]">سمت</span>
                            </label>
                            <select
                              className="w-full text-center rounded-md rounded-r-none border border-gray-300"
                              name="towards"
                              id="towards"
                              value={towards || ''}
                              onChange={handleTowardsChange}
                            >
                              <option className="appearance-none text-sm" value="">
                                انتخاب کنید
                              </option>
                              <option value={'0'}>همه</option>
                              <option value={'1'}>کاربر</option>
                              {userType === '1' && <option value={'2'}>سمت ها</option>}
                            </select>
                          </div>
                        )}

                        {towards === '2' && (
                          <div className="flex px-10 py-6 flex-col xs:flex-row">
                            <label
                              htmlFor="userRole"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <FaUserTie className='w-5 h-5' />
                              <span className="whitespace-nowrap text-center w-[113px]">سمت ها</span>
                            </label>
                            <select
                              className={`w-full text-center rounded-md rounded-r-none border border-gray-300`}
                              id="userRole"
                              value={userRole}
                              onChange={handleChangeUserRole}
                            >
                              <option value="0">همه</option>
                              {roleData?.data?.data?.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {towards === '1' && (
                          <div className="flex flex-col xs:flex-row px-10 py-6">
                            <label
                              htmlFor="userCode"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <FaUserPen className='w-5 h-5' />
                              <span className="whitespace-nowrap text-center w-[113px]">شماره کاربری</span>
                            </label>
                            <input
                              className="w-full border rounded-r-none border-gray-200 rounded-md "
                              type="text"
                              id="userCode"
                              {...register('userCode')}
                            />
                          </div>
                        )}
                        <div className="pr-8">
                          <DisplayError errors={formErrors.userType} />
                        </div>
                        <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">تنظیمات ارسال</h3>
                      {/* 
                      <div className="flex flex-col">
                        <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2"></div>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="flex flex-1">
                  <div className="bg-white w-full rounded-md shadow-item">
                    <h3 className="border-b p-6 text-gray-600">محتوا</h3>
                    <div className="flex mt-6 items-center px-4 gap-4 flex-col sm:flex-row">
                      <div className="w-full">
                        <label htmlFor={`ticket-type`} className="block mb-1 text-gray-900">
                          نوع تیکت را انتخاب کنید
                        </label>
                        <select
                          id={`ticket-type`}
                          className="bg-gray-50 border border-gray-300 w-full text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                          value={ticketType}
                          {...register('ticketTypeId', { onChange: handleChangeUserType })}
                        >
                          <option value="">انتخاب مرجوعی خرید</option>
                          {ticketTypeData?.data?.data?.map((ticketType) => (
                            <option key={ticketType.id} value={ticketType.id}>
                              {ticketType.name}
                            </option>
                          ))}
                        </select>
                        <DisplayError errors={formErrors.ticketTypeId} />
                      </div>

                      <div className="w-full">
                        <Controller
                          name="subject"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              classStyle={`bg-white rounded-md`}
                              isUserForm
                              {...field}
                              control={control}
                              errors={formErrors.subject}
                              label="عنوان تیکت را وارد کنید"
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="px-4">
                      <label className=" text-gray-700 md:min-w-max lg:text-sm" htmlFor="message">
                        محتوای تیکت را وارد کنید
                      </label>
                      <textarea
                        className="input mt-1 h-24 resize-none bg-white rounded-md border border-gray-200"
                        id="message"
                        {...register('message')}
                      />
                      <DisplayError errors={formErrors.message} />
                    </div>

                    <div className="border mb-4 mx-4 border-dashed border-[#009ef7] bg-[#f1faff] rounded text-center">
                      <input type="file" multiple className="hidden" id="Thumbnail" onChange={handleFileChange} />
                      <label htmlFor="Thumbnail" className="block cursor-pointer p-6 py-8 text-sm font-normal">
                        {selectedFiles.length > 0 ? (
                          <div className="flex flex-wrap gap-5 mt-0 px-8">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="text-sm text-gray-600 relative cursor-default">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-[80px] h-[88px] object-cover rounded-lg shadow-product"
                                />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 shadow-product hover:bg-red-500 hover:text-white bg-gray-50 p-0.5 rounded-full text-gray-500"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleDelete(index)
                                  }}
                                >
                                  <MdClose className="text-base" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-base">عکس ها را اینجا بکشید یا برای انتخاب کلیک کنید </div>
                        )}
                      </label>
                    </div>
                    <div className="bg-gray-50 bottom-0 w-full  rounded-b-lg px-8 flex flex-col pb-2"></div>
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
                      انتشار
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

export default dynamic(() => Promise.resolve(NewTicket), { ssr: false })
