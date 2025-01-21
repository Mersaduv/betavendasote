import React, { forwardRef, Fragment, useEffect, useState } from 'react'
import { useForm, Controller, useController, FieldError, Control } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Modal from 'react-modal'
import { profileFormSchema } from '@/utils'
import { ProfileForm as ProfileFormType } from '@/types'
import {
  TextField,
  LoginButton,
  Button,
  BackIconButton,
  DeleteIconButton,
  CloseIconButton,
  DisplayError,
} from '@/components/ui'
import { user2, user3 } from '@/icons'
import { Dialog, Transition } from '@headlessui/react'
import jalaali from 'jalaali-js'
import { showAlert } from '@/store'
import { useAppDispatch } from '@/hooks'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { FaRegCalendar, FaRegCalendarAlt } from 'react-icons/fa'
interface Props {
  onSubmit: (data: ProfileFormType) => void
  isLoading: boolean
  defaultValues: ProfileFormType
}

const toJalaali = (date: Date) => {
  const jalaaliDate = jalaali.toJalaali(date)
  return {
    day: jalaaliDate.jd,
    month: jalaaliDate.jm,
    year: jalaaliDate.jy,
  }
}
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  classStyle?: string | null
  label?: string
  errors?: FieldError | undefined
  name: string
  control: Control<any>
}
const days = Array.from({ length: 31 }, (_, i) => digitsEnToFa(String(i + 1)))
const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const currentDateJalaali = toJalaali(new Date())
const currentYearJalaali = currentDateJalaali.year
const years = Array.from({ length: 100 }, (_, i) => digitsEnToFa(String(currentYearJalaali - i)))

const ProfileForm: React.FC<Props> = ({ onSubmit, isLoading, defaultValues }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormType>({
    resolver: yupResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)


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

  if (errors) {
    console.log(errors, 'errors')
  }
  return (
    <form className="gap-x-5 grid md:grid-cols-2 w-full md:relative" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="mobileNumber"
        disabled
        control={control}
        render={({ field }) => (
          <TextFieldFa
            //  {...field} control={control} errors={errors.mobileNumber} label="شماره کاربری / موبایل"
            label="شماره کاربری / موبایل"
            control={control}
            errors={errors.mobileNumber}
            name="mobileNumber"
            // type="number"
            inputMode="numeric"
            readOnly
          />
        )}
      />
      <div>
        <span>جنسیت</span>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="flex gap-10 justify-center">
              <div className="flex items-center">
                <input
                  id="default-radio-1"
                  type="radio"
                  {...field}
                  value="بانو"
                  checked={field.value === 'بانو'}
                  name="default-radio"
                  className="w-4 h-4  mb-6 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-radio-1"
                  className="ms-2 cursor-pointer flex items-center gap-3 ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  بانو
                  <img className="w-10" src={user2.src} alt="user2" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="default-radio-2"
                  type="radio"
                  {...field}
                  value="آقا"
                  checked={field.value === 'آقا'}
                  name="default-radio"
                  className="w-4 h-4  mb-6 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-radio-2"
                  className="ms-2 cursor-pointer flex items-center gap-3 ml-3 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  آقا
                  <img className="w-10" src={user3.src} alt="user2" />
                </label>
              </div>
            </div>
          )}
        />
      </div>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => <TextField {...field} control={control} errors={errors.firstName} label="نام" />}
      />
      <Controller
        name="familyName"
        control={control}
        render={({ field }) => (
          <TextField {...field} control={control} errors={errors.familyName} label="نام خانوادگی" />
        )}
      />
      <Controller
        name="nationalCode"
        control={control}
        render={({ field }) => (
          <TextFieldFa
            label="کد ملی (اختیاری)"
            control={control}
            errors={errors.nationalCode}
            name="nationalCode"
            inputMode="numeric"
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
                errors={errors.birthDate}
                label="تاریخ تولد"
                readOnly
                isBirthDay
              />
            </div>
            <div
              onClick={handleModalOpen}
              className="bg-[#e90089] flex justify-center gap-3 hover:bg-[#e90088c0] text-center cursor-pointer border-[#e90089] rounded-l-md border text-sm text-white h-[38px] lg:h-[42px] items-center  whitespace-nowrap mt-1.5 w-full"
            >
              <FaRegCalendarAlt  className='w-5 h-5 text-white'  />
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
        name="bankAccountNumber"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            isBankNumber
            control={control}
            errors={errors.bankAccountNumber}
            label="شماره کارت بانکی"
          />
        )}
      />
      <Controller
        name="shabaNumber"
        control={control}
        render={({ field }) => (
          <TextField {...field} isSheba control={control} type="number" errors={errors.shabaNumber} label="شماره شبا" />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => <TextField {...field} control={control} errors={errors.email} label="پست الکترونیک" />}
      />
      <div className="w-full flex justify-end">
        {' '}
        <Button
          type="submit"
          className="md:mx-auto w-28 h-11 rounded-md md:absolute bottom-4 left-4 hover:bg-[#e90088bb]"
        >
          {' '}
          ذخیره{' '}
        </Button>{' '}
      </div>{' '}
    </form>
  )
}

const TextFieldFa = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { classStyle, label, errors, name, type = 'text', control, ...restProps } = props

  const { field } = useController({ name, control, rules: { required: true } })

  const direction = /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'ltr'
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // فیلتر کردن کاراکترهای غیر عددی
    const filteredValue = inputValue.replace(/[^0-9۰-۹]/g, '')

    // تبدیل اعداد انگلیسی به فارسی
    const faInputValue = digitsEnToFa(filteredValue)

    field.onChange(faInputValue)
  }

  return (
    <div>
      {label && (
        <label className="mb-3 block text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        className={`block appearance-none focus:outline-none outline-none ring-0 focus:ring-0 w-full ${
          classStyle ? classStyle : 'rounded-md bg-zinc-100'
        } border border-gray-200  px-3 py-1.5 text-base outline-none transition-colors placeholder:text-center focus:border-[#ffb9e2] lg:text-lg`}
        style={{ direction }}
        id={name}
        type="tel"
        value={field?.value}
        name={field.name}
        onBlur={field.onBlur}
        onChange={onChangeHandler}
        ref={ref}
        {...restProps}
      />
      <DisplayError errors={errors} />
    </div>
  )
})
export default ProfileForm
