import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/Layouts'
import { HandleResponse, JalaliDatePicker } from '@/components/shared'
import { ISmsMessageForm } from '@/types'
import {
  useCreateSmsMessageMutation,
  useGetRolesQuery,
  useGetSingleSmsMessageQuery,
  useUpdateSmsMessageMutation,
} from '@/services'
import { ProtectedRouteWrapper } from '@/components/user'
import { useEffect, useRef, useState } from 'react'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import { smsFormValidationSchema } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, DisplayError } from '@/components/ui'
import { FaUserPen, FaUsers } from 'react-icons/fa6'
import { HiUsers } from 'react-icons/hi'
import { FaUserTie } from 'react-icons/fa'
import { DateObject } from 'react-multi-date-picker'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
interface Props {}
const EditSms: NextPage<Props> = () => {
  // ? Assets
  const { query, push } = useRouter()
  const id = query.id as string
  const [userType, setUserType] = useState('')
  const [towards, setTowards] = useState('0')
  const [userRole, setUserRole] = useState('')
  const [sendingTime, setSendingTime] = useState(1)
  const [date, setDate] = useState<any | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const datePickerRef = useRef<any>(null)
  // ? Queries
  const { data: roleData } = useGetRolesQuery({ pageSize: 100 })
  const { refetch, data: selectedSms, isLoading: isLoadingGetSelectedSms } = useGetSingleSmsMessageQuery({ id })
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors: formErrors, isValid },
  } = useForm<ISmsMessageForm>({
    resolver: yupResolver(smsFormValidationSchema({ sendingTime })) as unknown as Resolver<ISmsMessageForm>,
    context: { sendingTime },
    mode: 'onChange',
  })

  useEffect(() => {
    const loadData = () => {
      if (selectedSms?.data) {
        const {
          id,
          subject,
          recipients,
          sendingTime: sendingTimeData,
          scheduledDate,
          description,
          allRoles,
          towards,
        } = selectedSms.data
        console.log(selectedSms.data, 'selectedSms.data')

        setUserType(recipients[0].userSpecification.userType)
        if (allRoles) {
          setTowards('2')
        }
        if (recipients[0].userSpecification.role && !allRoles && towards !== '0') {
          setUserRole(recipients[0].userSpecification.role.id.toString())
          setTowards('2')
        }
        if (
          recipients.length === 1 &&
          recipients[0].mobileNumber &&
          recipients[0].mobileNumber.trim() !== '' &&
          towards === '1'
        ) {
          setTowards('1')
        }
        setSendingTime(sendingTimeData)
        if (sendingTimeData === 2) {
          const isoDate = new Date(scheduledDate)
          const persianDate = new DateObject({
            date: isoDate,
            calendar: persian,
            locale: persian_fa,
          })
          setIsCalendarOpen(true)
          setDate(persianDate)
        }
        reset({
          id,
          subject,
          userType: parseInt(recipients[0].userSpecification.userType),
          description: description,
          sendingTime,
          userCode:
            (recipients.length === 1 &&
              recipients[0].mobileNumber &&
              recipients[0].mobileNumber.trim() !== '' &&
              towards === '1' &&
              recipients[0].mobileNumber) ||
            '',
        })
      }
    }
    loadData()
  }, [selectedSms])
  // ? Create
  // ? Create Sms
  const [updateSms, { isSuccess, isLoading, data, isError, error }] = useUpdateSmsMessageMutation()
  // ? Handlers
  const onSuccess = () => {
    push(`/admin/support/messages/sms-list`)
  }

  const handleSendingTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSendingTime = event.target.value
    setValue('sendingTime', Number(selectedSendingTime))
    setSendingTime(Number(selectedSendingTime))
  }
  const handleUserTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserType = event.target.value
    setValue('userType', Number(selectedUserType))
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

  const createHandler: SubmitHandler<ISmsMessageForm> = (data) => {
    console.log(data, 'data fprm')

    const formData: ISmsMessageForm = {
      id: selectedSms?.data?.id,
      userType: Number(data.userType),
      userCode: towards === '1' ? data.userCode : '',
      roleId: data.roleId || undefined,
      allRoles: towards === '2' && (data.roleId === undefined || data.roleId.trim() === '') ? true : false,
      towards: towards,
      subject: data.subject,
      description: data.description,
      scheduledDate: date ? date.format('HH:mm:ss - YYYY/MM/DD') : undefined,
      sendingTime: sendingTime,
    }
    updateSms(formData)
  }

  // ? Handlers
  const toggleCalendar = () => {
    if (isCalendarOpen) {
      datePickerRef.current.closeCalendar()
      setDate(undefined)
    } else {
      datePickerRef.current.openCalendar()
    }
    setIsCalendarOpen((prev) => !prev)
  }

  // useEffect(() => {
  //   if (!isCalendarOpen) {
  //     setDate('')
  //   }
  // }, [isCalendarOpen])

  useEffect(() => {
    if (date) {
      setValue('scheduledDate', date)
    } else {
      setValue('scheduledDate', undefined)
    }
  }, [date])

  console.log(towards)

  const scheduledDateWatch = watch('scheduledDate')

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
            <title>پیامک جدید</title>
          </Head>
          <DashboardLayout>
            <section className="bg-[#f5f8fa] w-full h-screen">
              <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(createHandler)}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">پیامک جدید</h3>

                      <div className="flex flex-col">
                        <div className="flex px-10 py-6 pt-6 pb-0 flex-col xs:flex-row">
                          <label
                            htmlFor="subject"
                            className="flex items-center xs:py-0 pt-2 justify-center px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                          >
                            <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" />
                            <span className="whitespace-nowrap text-center w-[113px]">عنوان</span>
                          </label>
                          <input
                            className="w-full border rounded-r-none border-gray-200 rounded-md "
                            type="text"
                            id="subject"
                            {...register('subject')}
                          />
                        </div>
                        <div className="pr-8">
                          <DisplayError errors={formErrors.subject} />
                        </div>
                        <div>
                          <div className="flex px-10 py-6 pt-0 flex-col xs:flex-row">
                            <label
                              htmlFor="userType"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <FaUsers className="w-5 h-5" />
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
                              <HiUsers className="w-5 h-5" />
                              <span className="whitespace-nowrap text-center w-[113px]">سمت</span>
                            </label>
                            <select
                              className="w-full text-center rounded-md rounded-r-none border border-gray-300"
                              name="towards"
                              id="towards"
                              value={towards}
                              onChange={handleTowardsChange}
                            >
                              <option className="appearance-none text-sm" value="">
                                انتخاب کنید
                              </option>
                              <option value={'0'}>همه</option>
                              <option value={'1'}>کاربر</option>
                              {userType == '1' && <option value={'2'}>سمت ها</option>}
                            </select>
                          </div>
                        )}

                        {towards === '2' && userType !== '0' && (
                          <div className="flex px-10 py-6 flex-col xs:flex-row">
                            <label
                              htmlFor="userRole"
                              className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                            >
                              {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                              <FaUserTie className="w-5 h-5" />
                              <span className="whitespace-nowrap text-center w-[113px]">سمت ها</span>
                            </label>
                            <select
                              className={`w-full text-center rounded-md rounded-r-none border border-gray-300`}
                              id="userRole"
                              value={userRole}
                              onChange={handleChangeUserRole}
                            >
                              <option value="">همه</option>
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
                              <FaUserPen className="w-5 h-5" />
                              <span className="whitespace-nowrap text-center w-[113px]">شماره کاربری</span>
                            </label>
                            <input
                              className="w-full border rounded-r-none farsi-digits border-gray-200 rounded-md "
                              type="text"
                              id="userCode"
                              {...register('userCode')}
                            />
                          </div>
                        )}
                        <div className="pr-8">
                          <DisplayError errors={formErrors.userType} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1">
                    <div className="bg-white w-full rounded-md shadow-item">
                      <h3 className="border-b p-6 text-gray-600 flex gap-2">تنظیمات ارسال</h3>

                      <div className="flex flex-col">
                        <div className="flex px-10 py-6 pt-6 flex-col xs:flex-row">
                          <label
                            htmlFor="sendingTime"
                            className="flex items-center justify-center xs:py-0 py-2 px-3 rounded-l-none rounded-md bg-[#f5f8fa]"
                          >
                            {/* <img className="w-5 h-5" src="/assets/svgs/duotone/text.svg" alt="" /> */}
                            <FaUsers className="w-5 h-5" />
                            <span className="whitespace-nowrap text-center w-[113px]">زمان ارسال</span>
                          </label>
                          <select
                            className="w-full text-center rounded-md rounded-r-none border border-gray-300"
                            id="sendingTime"
                            value={sendingTime}
                            {...register('sendingTime', { onChange: handleSendingTimeChange })}
                            // value={userType || ''}
                            // onChange={handleUserTypeChange}
                          >
                            <option className="appearance-none text-sm" value="">
                              انتخاب کنید
                            </option>
                            <option value={1}>فوری</option>
                            <option value={2}>مناسبتی</option>
                          </select>
                        </div>

                        {sendingTime == 2 && (
                          <div className="flex w-full">
                            <div className="flex flex-1 px-10 py-4 pt-0  flex-col mdx:flex-row">
                              <label
                                onClick={toggleCalendar}
                                htmlFor="date"
                                className="flex items-center cursor-pointer justify-center  py px-3  mdx:rounded-l-none rounded-t-md mdx:rounded-md bg-[#abd7ff]  gap-1 mdx:w-[160px]"
                              >
                                <img
                                  className="w-5 h-5  opacity-50"
                                  src="/assets/svgs/duotone/calendar-days.svg"
                                  alt=""
                                />
                                <span className="whitespace-nowrap text-center w-[113px]">زمان انتشار</span>
                              </label>

                              <div className={`${isCalendarOpen ? 'block w-full' : 'hidden'}`}>
                                <JalaliDatePicker setDate={setDate} date={date} datePickerRef={datePickerRef} />
                              </div>
                              <div
                                className={`${
                                  isCalendarOpen
                                    ? 'hidden'
                                    : 'border h-[42px] w-full rounded-l-md flex justify-center items-center'
                                }`}
                              >
                                انتخاب کنید{' '}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="pr-8 pb-4">
                          {/* <DisplayError errors={formErrors.scheduledDate} /> */}
                          <p className={`text-red-500 h-5 px-10  visible`}>
                            {formErrors.scheduledDate && sendingTime == 2
                              ? formErrors.scheduledDate.message
                              : scheduledDateWatch !== ''
                              ? ''
                              : 'وارد کردن نام محصول الزامی است'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1">
                  <div className="bg-white w-full rounded-md shadow-item">
                    <h3 className="border-b p-6 text-gray-600">متن پیامک</h3>
                    <div className="flex flex-col xs:flex-row px-4 py-4 pb-0 pt-6">
                      <textarea
                        className="input resize-none w-full h-[200px] border border-gray-200 rounded-md bg-white"
                        id="description"
                        {...register('description')}
                      />
                    </div>
                    <div className="pr-8">
                      <DisplayError errors={formErrors.description} />
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
                      className={`px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
                    >
                      ویرایش
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

export default dynamic(() => Promise.resolve(EditSms), { ssr: false })
