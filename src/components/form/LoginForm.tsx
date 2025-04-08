import { useEffect, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { BiRightArrowAlt } from 'react-icons/bi'

import { mobileNumberSchema } from '@/utils'

import { DisplayError, LoginButton } from '@/components/ui'

import type { MobileNumberFormValues } from '@/types'
import Link from 'next/link'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import React, { forwardRef } from 'react'
import { Control, FieldError, useController } from 'react-hook-form'
import { useGetRedirectsQuery } from '@/services'
import { useAppSelector } from '@/hooks'

interface Props {
  onSubmit: (data: MobileNumberFormValues) => void
  isLoading: boolean
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  classStyle?: string | null
  label?: string
  errors?: FieldError | undefined
  name: string
  control: Control<any>
}

const LoginForm: React.FC<Props> = (props) => {
  const { onSubmit, isLoading } = props
  const { generalSetting } = useAppSelector((state) => state.design)
  const [stage, setStage] = useState<'mobileNumber'>('mobileNumber')
  const { data: redirectData, isLoading: isLoadingRedirect, isError: isErrorRedirect } = useGetRedirectsQuery()

  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
    setFocus,
    trigger,
  } = useForm<MobileNumberFormValues>({
    resolver: yupResolver(mobileNumberSchema),
    defaultValues: { mobileNumber: '' },
  })

  const mobileNumberRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (stage === 'mobileNumber') {
      setFocus('mobileNumber')
      mobileNumberRef.current?.focus()
    }
  }, [stage, setFocus])

  return (
    <form className="flex flex-col justify-between h-full" onSubmit={handleSubmit(onSubmit)}>
      <>
        <h2 className="text-gray-300 text-base text-center mb-12">شماره همراه خود را وارد کنید</h2>
        <TextField
          id="mobileNumber"
          control={control}
          errors={formErrors.mobileNumber}
          placeholder={digitsEnToFa('09...')}
          name="mobileNumber"
          classStyle="rounded-3xl shadow-lg text-center farsi-digits"
          ref={mobileNumberRef}
          inputMode="numeric"
          pattern="[0-9]*"
          // type='number'
        />
        <LoginButton
          className="mx-auto w-full rounded-3xl py-2 bg-[#f792ce] border-2 border-[#e90089] hover:bg-[#e90089]"
          isLoading={isLoading}
        >
          ادامه
        </LoginButton>
        <div className="pt-4 flex items-center justify-center w-full ">
          <div className=" text-gray-800 text-sm flex mt-8">
            شرایط استفاده از{' '}
            <Link href={`/articles/${redirectData?.data?.slug}`} className="text-blue-400 text-sm mx-1">
              قوانین و حریم خصوصی{' '}
            </Link>{' '}
            {generalSetting?.title} را می پذیرم
          </div>
        </div>
      </>

      {/* {stage === 'password' && (
        <>
          <h2 className="text-gray-300 text-base text-center ">رمز خود را وارد کنید</h2>
          <button type="button" onClick={handleBackToMobileNumber}>
            <BiRightArrowAlt className="text-[#e90089]" size={34} />
          </button>
          <TextField
            control={control}
            errors={formErrors.password}
            type="password"
            placeholder="رمز عبور"
            name="password"
            classStyle="rounded-3xl text-center shadow-lg "
            ref={passwordRef}
          />
          <LoginButton className="mx-auto w-full rounded-3xl py-2 bg-[#f792ce] border-2 border-[#e90089] hover:bg-[#e90089]" isLoading={isLoading}>ورود</LoginButton>

          <div className="pt-4 flex items-center ">
            <p className="ml-1 inline text-gray-800 text-sm mt-8">رمز عبور رو فراموش کردی؟</p>
            <div className="text-blue-400 text-sm mt-8">فراموشی رمز عبور</div>
          </div>
        </>
      )} */}
    </form>
  )
}

const TextField = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { classStyle, label, errors, name, type = 'text', control, ...restProps } = props

  const { field } = useController({ name, control, rules: { required: true } })

  const direction = /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'ltr'
 // ? Handlers
 const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value

  if (type === 'number' && inputValue.length !== 0) {
    field.onChange(parseInt(inputValue))
  } else {
    field.onChange(inputValue)
  }
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

export default LoginForm
