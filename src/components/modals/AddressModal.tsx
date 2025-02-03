import { forwardRef, useEffect, useState } from 'react'
import { useEditUserAddressMutation, useGetUserAddressInfoQuery } from '@/services'
import { Control, Controller, FieldError, Resolver, SubmitHandler, useController, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { addressSchema } from '@/utils'
import { HandleResponse } from '@/components/shared'
import { Modal, DisplayError, TextField, SubmitModalButton, Combobox } from '@/components/ui'
import type { AddressForm, IAddress } from '@/types'
import { digitsEnToFa } from '@persian-tools/persian-tools'

const iranCity = require('iran-city')

interface Props {
  isShow: boolean
  onClose: () => void
  address: IAddress
  refetch: () => void
  openIsAddressList?: () => void
  mode?: 'edit'
}
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  classStyle?: string | null
  label?: string
  errors?: FieldError | undefined
  name: string
  control: Control<any>
}
const AddressModal: React.FC<Props> = (props) => {
  const { isShow, onClose, address, refetch, openIsAddressList, mode } = props
  const AllProvinces = iranCity.allProvinces()
  const { data: userInfo } = useGetUserAddressInfoQuery({ page: 1 })

  const [cities, setCities] = useState([])

  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    setValue,
    getValues,
    watch,
    reset,
  } = useForm<Omit<IAddress, 'id' | 'userId'>>({
    resolver: yupResolver(addressSchema) as unknown as Resolver<Omit<IAddress, 'id' | 'userId'>>,
    defaultValues: {
      fullName: address.fullName || '',
      mobileNumber: address.mobileNumber || '',
      fullAddress: address.fullAddress || '',
      province: address.province || {},
      city: address.city || {},
      postalCode: address.postalCode || '',
    },
    mode: 'onChange',
  })

  const [editAddress, { data, isSuccess, isLoading, isError, error }] = useEditUserAddressMutation()

  useEffect(() => {
    if (address.province) {
      setCities(iranCity.citiesOfProvince(address.province.id))
    }
    reset(address)
  }, [address, reset])

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'province') {
        setCities(iranCity.citiesOfProvince(value.province?.id))
        setValue('city', {} as IAddress['city'])
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  useEffect(() => {
    if (userInfo?.data) {
      setValue('city', userInfo.data.city)
    }
  }, [userInfo, setValue])

  const submitHandler: SubmitHandler<Omit<IAddress, 'id' | 'userId'>> = async (address) => {
    try {
      await editAddress({
        body: address,
      }).unwrap()
      refetch()
      if (openIsAddressList) {
        openIsAddressList()
      }
    } catch (error) {
      console.error('Failed to update user data:', error)
    }
  }

  return (
    <div className="">
      {(isSuccess || isError) && (
        <HandleResponse
          isError={isError}
          isSuccess={isSuccess}
          error={error}
          message={data?.message}
          onSuccess={onClose}
        />
      )}

      <Modal isShow={isShow} onClose={onClose} effect="bottom-to-top">
        <Modal.Content
          onClose={onClose}
          className="flex h-full flex-col z-[199] gap-y-5 bg-white px-5 py-5 md:rounded-lg "
        >
          <Modal.Header onClose={onClose}>{mode === 'edit' ? 'ویرایش آدرس' : 'ثبت آدرس جدید'}</Modal.Header>
          <Modal.Body>
            <div className="w-full">
              <p className="mb-5 ">لطفا آدرس تحویل گیرنده مرسوله را وارد کنید.</p>
              <form
                className="flex flex-1 flex-col justify-between overflow-y-auto pl-4"
                onSubmit={handleSubmit(submitHandler)}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <TextField label="نام کامل گیرنده" control={control} errors={formErrors.fullName} name="fullName" />
                  <TextFieldFa
                    control={control}
                    errors={formErrors.mobileNumber}
                    name="mobileNumber"
                    label="شماره موبایل گیرنده"
                  />
                  <div className="space-y-2">
                    <Combobox
                      control={control}
                      name="province"
                      list={AllProvinces}
                      placeholder="لطفا استان خود را انتخاب کنید"
                    />
                    <DisplayError errors={formErrors.province?.name} />
                  </div>

                  <div className="space-y-2 ">
                    <Combobox
                      control={control}
                      name="city"
                      list={cities}
                      placeholder="لطفا شهرستان خود را انتخاب کنید"
                    />
                    <DisplayError errors={formErrors.city?.name} />
                  </div>

                  <div className="col-span-2">
                    <TextField
                      label="آدرس کامل گیرنده"
                      control={control}
                      errors={formErrors.fullAddress}
                      name="fullAddress"
                    />
                  </div>

                  <TextFieldPostal
                    label="کد پستی"
                    control={control}
                    errors={formErrors.postalCode}
                    name="postalCode"
                    // type="number"
                    inputMode="numeric"
                  />
                </div>

                <div className="border-t-2 border-gray-200 py-3 lg:pb-0 flex justify-end">
                  <SubmitModalButton className="" isLoading={isLoading}>
                    {mode === 'edit' ? 'بروزرسانی' : 'ثبت آدرس جدید'}
                  </SubmitModalButton>
                </div>
              </form>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </div>
  )
}
const TextFieldPostal = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { classStyle, label, errors, name, type = 'text', control, ...restProps } = props

  const { field } = useController({ name, control, rules: { required: true } })

  const direction = /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'ltr'
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // فیلتر کردن کاراکترهای غیر عددی
    const filteredValue = inputValue.replace(/[^0-9۰-۹]/g, '')

    field.onChange(filteredValue)
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
        } border border-gray-200  px-3 py-1.5 farsi-digits text-base outline-none transition-colors placeholder:text-center focus:border-[#ffb9e2] lg:text-lg`}
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

const TextFieldFa = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { classStyle, label, errors, name, type = 'text', control, ...restProps } = props

  const { field } = useController({ name, control, rules: { required: true } })

  const direction = /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'ltr'
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // فیلتر کردن کاراکترهای غیر عددی
    const filteredValue = inputValue.replace(/[^0-9۰-۹]/g, '')

    field.onChange(filteredValue)
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
        } border border-gray-200 farsi-digits px-3 py-1.5 text-base outline-none transition-colors placeholder:text-center focus:border-[#ffb9e2] lg:text-lg`}
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
export default AddressModal
